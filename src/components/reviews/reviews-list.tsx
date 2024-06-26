import { Review } from '../../types/review';
import { ReviewComment } from './review-comment';

type ReviewsListProps = {
  reviewComments: Review[];
}

export function ReviewsList({ reviewComments }: ReviewsListProps) {
  return (
    <div>
      <h2 className="reviews__title">Reviews &middot; <span className="reviews__amount">{reviewComments.length}</span></h2>
      <ul className="reviews__list">
        {reviewComments.map((item) => (
          <ReviewComment key={item.id} review={item} {...item}/>
        ))}
      </ul>
    </div>
  );
}
