import { useState } from "react";
import { X, Plus, Trash2, BarChart2 } from "lucide-react";
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const filledOptions = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim()) return;
    if (filledOptions.length < 2) return;

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-base-100 rounded-2xl shadow-2xl border border-base-300 w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-base-200">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <BarChart2 size={18} className="text-primary" />
                  </div>
                  <h2 className="font-semibold text-base">Create a Poll</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="btn btn-ghost btn-circle btn-sm"
                  type="button"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-5 space-y-5">
                {/* Question */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
                    Question
                  </label>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a question…"
                    maxLength={200}
                    className="input input-bordered w-full text-sm focus:input-primary"
                    required
                  />
                </div>

                {/* Options */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
                    Options{" "}
                    <span className="normal-case font-normal">
                      ({options.length}/10)
                    </span>
                  </label>

                  <div className="space-y-2">
                    <AnimatePresence initial={false}>
                      {options.map((opt, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center gap-2"
                        >
                          <span className="text-xs font-bold text-base-content/30 w-5 text-center shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) =>
                              handleOptionChange(idx, e.target.value)
                            }
                            placeholder={`Option ${idx + 1}`}
                            maxLength={100}
                            className="input input-bordered input-sm flex-1 text-sm focus:input-primary"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            disabled={options.length <= 2}
                            className="btn btn-ghost btn-circle btn-xs text-error disabled:opacity-20"
                          >
                            <Trash2 size={13} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {options.length < 10 && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="btn btn-ghost btn-sm gap-1.5 text-primary text-xs mt-1"
                    >
                      <Plus size={14} />
                      Add option
                    </button>
                  )}
                </div>

                {/* Optional expiry */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
                    Expires at{" "}
                    <span className="normal-case font-normal">(optional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="input input-bordered input-sm w-full text-sm focus:input-primary"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn btn-ghost flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !question.trim() ||
                      options.filter((o) => o.trim()).length < 2
                    }
                    className="btn btn-primary flex-1"
                  >
                    {isSubmitting ? (
                      <span className="loading loading-spinner loading-sm" />
                    ) : (
                      "Create Poll"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PollCreatorModal;
