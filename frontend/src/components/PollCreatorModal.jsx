import { useState } from "react";
import { createPortal } from "react-dom";
import {
  BarChart3,
  Loader2,
  Plus,
  Trash2,
  X,
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

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={handleClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.16 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#141313] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-zinc-200/80 dark:border-zinc-800/80 px-5 py-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                  <BarChart3 className="h-4 w-4 stroke-[1.75]" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                    Create poll
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    Ask a question for members in this group.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Close modal"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4 stroke-[1.75]" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="max-h-[75vh] overflow-y-auto px-5 py-4 space-y-4"
            >
              {/* Question */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="poll-question"
                    className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Question
                  </label>
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500 tabular-nums">
                    {question.length}/200
                  </span>
                </div>

                <textarea
                  id="poll-question"
                  rows={2}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What would you like to ask?"
                  maxLength={200}
                  required
                  className="w-full resize-none rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                />
              </div>

              {/* Options */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Options
                  </span>
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500 tabular-nums">
                    {options.length}/10
                  </span>
                </div>

                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {options.map((opt, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.14 }}
                        className="flex items-center gap-2"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/50 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 tabular-nums">
                          {idx + 1}
                        </span>

                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          placeholder={`Option ${idx + 1}`}
                          maxLength={100}
                          className="h-9 flex-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 px-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          disabled={options.length <= 2}
                          aria-label={`Remove option ${idx + 1}`}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-red-50/70 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-0 disabled:pointer-events-none transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5 stroke-[1.75]" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {options.length < 10 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="mt-2.5 flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 stroke-[1.75]" />
                    <span>Add option</span>
                  </button>
                )}
              </div>

              {/* Expiration */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                <label
                  htmlFor="poll-expires-at"
                  className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                >
                  Expiration date{" "}
                  <span className="font-normal text-zinc-400 dark:text-zinc-500">
                    (optional)
                  </span>
                </label>
                <input
                  id="poll-expires-at"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 px-3 text-xs text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 px-3.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 px-4 text-xs font-medium text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create poll</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default PollCreatorModal;