import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle } from 'react-icons/fi';

/**
 * ConfirmModal — Glassmorphism confirmation dialog
 * Uses AnimatePresence for smooth enter/exit transitions
 * Features backdrop blur, scale animation, and spatial depth
 */
const ConfirmModal = ({ isOpen, onConfirm, onCancel, title, message }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onCancel}
        >
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon */}
            <div className="modal-icon">
              <FiAlertTriangle size={32} color="var(--priority-urgent)" />
            </div>

            {/* Title & Message */}
            <h3 className="modal-title">{title || 'Confirm Action'}</h3>
            <p className="modal-message">
              {message || 'Are you sure you want to proceed?'}
            </p>

            {/* Action Buttons */}
            <div className="modal-actions">
              <motion.button
                className="btn btn-secondary"
                onClick={onCancel}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Cancel
              </motion.button>
              <motion.button
                className="btn btn-danger"
                onClick={onConfirm}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
