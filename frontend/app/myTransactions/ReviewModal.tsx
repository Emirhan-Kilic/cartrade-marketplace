import { useState } from 'react';

type ReviewModalProps = {
    isOpen: boolean;
    onClose: () => void;
    transactionId: number; // The transaction ID to be linked with the review
    adOwnerId: number; // The ID of the ad owner (evaluated user)
    currentUserId: number; // The current logged-in user (reviewer)
    onSubmitReview: (rating: number, comment: string) => void;
};

const ReviewModal = ({
    isOpen,
    onClose,
    transactionId,
    adOwnerId,
    currentUserId,
    onSubmitReview,
}: ReviewModalProps) => {
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (rating < 1 || rating > 5) {
            setError('Invalid rating. Please select a value between 1 and 5.');
            return;
        }

        // Trigger the review submission in the parent component
        onSubmitReview(rating, comment);
        onClose();  // Close the modal after submitting
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Leave a Review</h2>
                <form onSubmit={handleSubmit}>
                    {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
                    <div className="mb-4">
                        <label htmlFor="rating" className="block text-gray-700">Rating (1-5)</label>
                        <input
                            type="number"
                            id="rating"
                            name="rating"
                            min="1"
                            max="5"
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="comment" className="block text-gray-700">Comment</label>
                        <textarea
                            id="comment"
                            name="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                            rows={4}
                        />
                    </div>
                    <div className="flex justify-between">
                        <button
                            type="button"
                            className="bg-gray-300 text-gray-800 py-2 px-4 rounded-md"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white py-2 px-4 rounded-md"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
