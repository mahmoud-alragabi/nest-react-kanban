import React, { useState } from "react";

interface UpdatePopupProps {
  popupTitle: string;
  onSave: (title: string) => Promise<void>;
  onCancel: () => void;
  initialValue?: string;
}

const UpdatePopup: React.FC<UpdatePopupProps> = ({
  popupTitle,
  onSave = async () => {},
  onCancel,
  initialValue = "",
}) => {
  const [inputTitle, setInputTitle] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();

    await onSave(inputTitle);

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded shadow p-6 w-96">
        <h3 className="text-xl font-semibold mb-4">{popupTitle}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="popup-title" className="block text-gray-700 mb-2">
              Title
            </label>
            <input
              id="popup-title"
              type="text"
              value={inputTitle}
              onChange={(e) => setInputTitle(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              type="submit"
              className={`py-2 px-4 ${loading ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"} text-white rounded`}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePopup;
