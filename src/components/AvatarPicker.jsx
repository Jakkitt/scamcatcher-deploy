// src/components/AvatarPicker.jsx
import React, { useRef } from "react";

export default function AvatarPicker({ value, onChange, size = 112 }) {
  const inputRef = useRef(null);

  const openPicker = () => inputRef.current?.click();

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange?.(reader.result); // base64
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={openPicker}
        className="rounded-full overflow-hidden ring-1 ring-gray-200 hover:ring-gray-300 focus:outline-none"
        style={{ width: size, height: size }}
        title="เปลี่ยนรูปโปรไฟล์"
      >
        {value ? (
          <img
            src={value}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
            <span className="text-sm">เลือกรูป</span>
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFile}
      />
    </div>
  );
}
