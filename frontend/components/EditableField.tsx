import { useState, useEffect } from "react";
import { Edit2, Check, X } from "lucide-react";
import { cn } from "../lib/utils";

interface EditableFieldProps {
  label: string;
  value: string | string[];
  type: "text" | "textarea" | "tags";
  onSave: (value: string | string[]) => void;
  disabled?: boolean;
}

export function EditableField({ label, value, type, onSave, disabled }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState<string | string[]>(value);

  // Sync with prop when it changes from outside
  useEffect(() => {
    if (!isEditing) {
      setCurrentValue(value);
    }
  }, [value, isEditing]);

  const handleSave = () => {
    onSave(currentValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCurrentValue(value);
    setIsEditing(false);
  };

  const renderDisplay = () => {
    if (type === "tags" && Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-2 mt-1">
          {value.length > 0 ? value.map((tag, i) => (
            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md border border-gray-200">
              {tag}
            </span>
          )) : <span className="text-gray-400 italic">No tags</span>}
        </div>
      );
    }
    return <p className={cn("text-gray-900 mt-1", !value && "text-gray-400 italic")}>{String(value) || "Empty"}</p>;
  };

  const renderInput = () => {
    if (type === "textarea") {
      return (
        <textarea
          value={currentValue as string}
          onChange={(e) => setCurrentValue(e.target.value)}
          className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          autoFocus
        />
      );
    }
    if (type === "tags") {
      return (
        <input
          type="text"
          value={Array.isArray(currentValue) ? currentValue.join(", ") : currentValue}
          onChange={(e) => setCurrentValue(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
          placeholder="Comma separated tags"
          className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoFocus
        />
      );
    }
    return (
      <input
        type="text"
        value={currentValue as string}
        onChange={(e) => setCurrentValue(e.target.value)}
        className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        autoFocus
      />
    );
  };

  return (
    <div className="mb-6 group">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {!isEditing && !disabled && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-2">
          {renderInput()}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className="flex items-center px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
            >
              <Check className="h-4 w-4 mr-1" /> Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors"
            >
              <X className="h-4 w-4 mr-1" /> Cancel
            </button>
          </div>
        </div>
      ) : (
        renderDisplay()
      )}
    </div>
  );
}
