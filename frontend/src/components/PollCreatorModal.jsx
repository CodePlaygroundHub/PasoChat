import { useState } from "react";
import { createPortal } from "react-dom";
import { 
  X, 
  Plus, 
  Trash2, 
  BarChart3, 
  Calendar, 
  Sparkles, 
  HelpCircle, 
  Layers 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePollStore } from "../store/usePollStore";

const PollCreatorModal = ({ isOpen, onClose, groupId }) => {
  const { createPoll } = usePollStore();

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [expiresAt, setExpiresAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddOption = () => {
    if (options.length >= 10) return;
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const filledOptions = options.map((o) => o.trim()).filter(Boolean);
  const isValid = question.trim().length > 0 && filledOptions.length >= 2;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    const result = await createPoll(groupId, {
      question: question.trim(),
      options: filledOptions,
      expiresAt: expiresAt || null,
    });
    setIsSubmitting(false);

    if (result) {
      handleClose();
    }
  };

  const handleClose = () => {
    setQuestion("");
    setOptions(["", ""]);
    setExpiresAt("");
    onClose();
  };

  // Mount directly to document body to completely cover navbar and sidebars
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Full Screen Backdrop (covers entire app) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[28px] shadow-2xl border border-pink-500/20 overflow-hidden z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Accent Gradient Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-pink-50 dark:bg-pink-950/40 text-pink-500 rounded-2xl ring-1 ring-pink-500/20">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <h2 className="font-bold text-[16px] text-zinc-800 dark:text-zinc-100 leading-tight">
                    Create a Poll
                  </h2>
                  <p className="text-[12px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                    Ask a question and let your group decide
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleClose}
                type="button"
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X size={17} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Question */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                  <span className="flex items-center gap-1 text-pink-600 dark:text-pink-400">
                    <HelpCircle size={12} /> Question
                  </span>
                  <span className="font-normal lowercase text-zinc-400">{question.length}/200</span>
                </div>
                <textarea
                  rows={2}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What's on your mind?..."
                  maxLength={200}
                  className="w-full text-sm p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 focus:bg-white dark:focus:bg-zinc-800 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all resize-none text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400"
                  required
                />
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[11px] font-bold tracking-wider text-pink-600 dark:text-pink-400 uppercase">
                    <Layers size={12} /> Poll Options
                  </span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                    {options.length}/10
                  </span>
                </div>

                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {options.map((opt, idx) => {
                      const hasContent = opt.trim().length > 0;
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center gap-2"
                        >
                          {/* Number Badge */}
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                            hasContent
                              ? "bg-pink-500 text-white shadow-sm shadow-pink-500/20" 
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                          }`}>
                            {idx + 1}
                          </div>

                          {/* Input */}
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                            placeholder={`Option ${idx + 1}`}
                            maxLength={100}
                            className="flex-1 h-9 text-sm px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 focus:bg-white dark:focus:bg-zinc-800 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400"
                          />

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            disabled={options.length <= 2}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-0 transition-all shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Add Option Trigger */}
                {options.length < 10 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-pink-300 dark:border-pink-800/60 hover:border-pink-500 bg-pink-50/40 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400 text-xs font-semibold hover:bg-pink-50 transition-all"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                    <span>Add Another Option</span>
                  </button>
                )}
              </div>

              {/* Expiration */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-1 text-[11px] font-bold tracking-wider text-pink-600 dark:text-pink-400 uppercase">
                  <Calendar size={12} /> Expiration Date
                  <span className="font-normal lowercase text-zinc-400">(optional)</span>
                </div>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full h-9 text-xs sm:text-sm px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 focus:bg-white dark:focus:bg-zinc-800 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all text-zinc-700 dark:text-zinc-200"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isValid && !isSubmitting
                      ? "bg-pink-500 hover:bg-pink-600 text-white shadow-lg shadow-pink-500/25 active:scale-[0.98]"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Create Poll</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default PollCreatorModal;