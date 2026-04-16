"""add result column

Revision ID: 61ef81502d53
Revises: e6a42e856e7b
Create Date: 2026-04-16

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision: str = '61ef81502d53'
down_revision: Union[str, Sequence[str], None] = 'e6a42e856e7b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# 🔥 Define new enum
document_status_enum = postgresql.ENUM(
    'PENDING_UPLOAD', 'UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED',
    name='document_status'
)


def upgrade() -> None:
    bind = op.get_bind()

    # ----------------------------
    # 1. Create new enum
    # ----------------------------
    document_status_enum.create(bind, checkfirst=True)

    # ----------------------------
    # 2. Add result column
    # ----------------------------
    op.add_column('pdfs', sa.Column('result', sa.JSON(), nullable=True))

    # ----------------------------
    # 3. Convert enum safely
    # ----------------------------
    op.execute("""
        ALTER TABLE pdfs
        ALTER COLUMN status TYPE document_status
        USING status::text::document_status
    """)

    # ----------------------------
    # 4. Drop old enum (optional)
    # ----------------------------
    op.execute("DROP TYPE IF EXISTS upload_status")

    # ----------------------------
    # 5. Indexes
    # ----------------------------
    op.create_index('idx_task_status', 'pdfs', ['task_id', 'status'], unique=False)
    op.create_index(op.f('ix_pdfs_status'), 'pdfs', ['status'], unique=False)
    op.create_index(op.f('ix_pdfs_task_id'), 'pdfs', ['task_id'], unique=False)

    # ----------------------------
    # 6. FK update
    # ----------------------------
    op.drop_constraint(op.f('pdfs_task_id_fkey'), 'pdfs', type_='foreignkey')
    op.create_foreign_key(None, 'pdfs', 'tasks', ['task_id'], ['id'], ondelete='CASCADE')

    # ----------------------------
    # 7. Remove unused column
    # ----------------------------
    op.drop_column('pdfs', 's3_url')

    # ----------------------------
    # 8. Tasks updates
    # ----------------------------
    op.add_column('tasks', sa.Column('name', sa.String(), nullable=False))
    op.create_index(op.f('ix_tasks_status'), 'tasks', ['status'], unique=False)
    op.create_index(op.f('ix_tasks_user_id'), 'tasks', ['user_id'], unique=False)

    op.drop_constraint(op.f('tasks_user_id_fkey'), 'tasks', type_='foreignkey')
    op.create_foreign_key(None, 'tasks', 'users', ['user_id'], ['id'], ondelete='CASCADE')


def downgrade() -> None:
    bind = op.get_bind()

    # ----------------------------
    # 1. Recreate old enum
    # ----------------------------
    upload_status_enum = postgresql.ENUM(
        'PENDING', 'UPLOADING', 'UPLOADED', 'FAILED',
        name='upload_status'
    )
    upload_status_enum.create(bind, checkfirst=True)

    # ----------------------------
    # 2. Convert back
    # ----------------------------
    op.execute("""
        ALTER TABLE pdfs
        ALTER COLUMN status TYPE upload_status
        USING status::text::upload_status
    """)

    # ----------------------------
    # 3. Drop new enum
    # ----------------------------
    document_status_enum.drop(bind, checkfirst=True)

    # ----------------------------
    # 4. Revert schema changes
    # ----------------------------
    op.drop_constraint(None, 'tasks', type_='foreignkey')
    op.create_foreign_key(op.f('tasks_user_id_fkey'), 'tasks', 'users', ['user_id'], ['id'])

    op.drop_index(op.f('ix_tasks_user_id'), table_name='tasks')
    op.drop_index(op.f('ix_tasks_status'), table_name='tasks')
    op.drop_column('tasks', 'name')

    op.add_column('pdfs', sa.Column('s3_url', sa.VARCHAR(), nullable=True))

    op.drop_constraint(None, 'pdfs', type_='foreignkey')
    op.create_foreign_key(op.f('pdfs_task_id_fkey'), 'pdfs', 'tasks', ['task_id'], ['id'])

    op.drop_index(op.f('ix_pdfs_task_id'), table_name='pdfs')
    op.drop_index(op.f('ix_pdfs_status'), table_name='pdfs')
    op.drop_index('idx_task_status', table_name='pdfs')

    op.drop_column('pdfs', 'result')