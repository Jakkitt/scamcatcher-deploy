import React, { useRef, useState } from "react";

export default function AvatarPicker({ value, onChange, size = 112 }) {
  const inputRef = useRef(null);
  const [hover, setHover] = useState(false);

  const openFile = () => inputRef.current?.click();

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("กรุณาเลือกรูปภาพ");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("ขนาดไฟล์ต้องไม่เกิน 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange?.(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="relative inline-block"
      style={{ width: size, height: size }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        type="button"
        onClick={openFile}
        className="w-full h-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 ring-1 ring-black/5 focus:outline-none"
        title="คลิกเพื่อเปลี่ยนรูป"
      >
        {value ? (
          <img
            src={value}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-gray-500">
            <span>เลือกรูป</span>
          </div>
        )}
        {/* overlay เมื่อ hover */}
        {hover && (
          <div className="absolute inset-0 bg-black/40 grid place-items-center text-white text-sm">
            เปลี่ยนรูป
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
