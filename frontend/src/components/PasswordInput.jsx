import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * A password input with a show/hide toggle. Keeps the same styling as the
 * plain text inputs so it drops in as a drop-in replacement.
 */
export const PasswordInput = ({ id, value, onChange, placeholder, className, disabled }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3.5 py-2.5 text-sm border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-ddu-500 focus:border-ddu-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 pr-10 ${className || ''}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-2.5 top-2.5 p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-md transition-colors"
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default PasswordInput;