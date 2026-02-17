import React from 'react';

const DeleteModal = ({ isOpen, onClose, onConfirm, contact }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg w-full max-w-md border border-zinc-800">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-2">Delete Contact</h2>
          <p className="text-zinc-400 mb-6">
            Are you sure you want to delete {contact?.firstName} {contact?.lastName}? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;