import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useState } from 'react';
import { ReviewsList } from '../../components/reviews/reviews-list';
import { Header } from '../../components/header/Header';
import { Map } from '../../components/map/map';
import { OfferType } from '../../types/offer';
import { OffersNearby } from '../../components/offers/offers-nearby';
import { useAppDispatch, useAppSelector } from '../../components/hooks';
import { fetchReviewComments, fetchSingleOffer, updateFavorite } from '../../api/api-action';
import { setLoadingStatus } from '../../store/actions/offer-actions';
import ReviewForm from '../../components/reviews/review-form';
import { Points } from '../../types/point';
import { FavouritesStatus } from '../../types/favorites';
import { updateFavoritesCount } from '../../store/actions/favorites-actions';
import { AuthorizationStatus } from '../../const';
import { sortReviewsByDate } from '../../utils';
import Spinner from '../loading-screen/loading-screen';
import { NotFoundPage } from '../not-found-screen/not-found-screen';

type OfferProps = {
  offers: OfferType[];
}

export function Offer({ offers }: OfferProps): JSX.Element {
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const offer = offers.find((obj) => obj.id === id);
  const currentOffer = useAppSelector((state) => state.offer.currentOffer);
  const currentReviews = useAppSelector((state) => state.offer.currentOfferReviews);
  const isAuthorized = useAppSelector((state) => state.user.authorizationStatus);
  const favoritesCount = useAppSelector((state) => state.favorites.favoritesCount);
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(offer?.isFavorite);
  useEffect(() => {
    if (offer?.id) {
      dispatch(fetchSingleOffer({id: offer.id}));
      dispatch(fetchReviewComments({id: offer.id}));
      dispatch(setLoadingStatus(false));
    }
  }, [dispatch, offer?.id]);

  if (!offer) {
    return (
      <NotFoundPage/>
    );
  }

  if (!currentOffer) {
    return (
      <Spinner/>
    );
  }

  function handleIsFavorite() {
    if (isAuthorized === AuthorizationStatus.Authorized) {
      if (isFavorite) {
        dispatch(updateFavorite({
          id: offer?.id,
          status: FavouritesStatus.Delete
        }));
        setIsFavorite(false);
        dispatch(updateFavoritesCount(favoritesCount - 1));
      } else {
        dispatch(updateFavorite({
          id: offer?.id,
          status: FavouritesStatus.Add
        }));
        setIsFavorite(true);
        dispatch(updateFavoritesCount(favoritesCount + 1));
      }
    } else {
      navigate('/login');
    }
  }

  const offersNearby = offers.filter((o) => o !== offer).slice(0, 3);
  const points: Points = offersNearby.concat(offer).map((item) => ({
    id: item.id,
    location: item.location
  }));
  const selectedPoint = points.find((o) => o.id === offer?.id);

  return (
    <div className="page">
      <Header/>

      <main className="page__main page__main--offer">
        <section className="offer">
          <div className="offer__gallery-container container">
            <div className="offer__gallery">
              {currentOffer?.images.map((img) => (
                <div className="offer__image-wrapper" key={img}>
                  <img className="offer__image" src={img} alt={`Photo studio ${currentOffer?.id}`}></img>
                </div>
              ))}
            </div>
          </div>
          <div className="offer__container container">
            <div className="offer__wrapper">
              {currentOffer?.isPremium && (
                <div className="offer__mark">
                  <span>Premium</span>
                </div>
              )}
              <div className="offer__name-wrapper">
                <h1 className="offer__name">
                  {currentOffer?.title}
                </h1>
                <button
                  className={`offer__bookmark-button ${
                    isFavorite && isAuthorized === AuthorizationStatus.Authorized ? 'offer__bookmark-button--active' : ''
                  } button`}
                  type="button"
                  onClick={handleIsFavorite}
                >
                  <svg className="offer__bookmark-icon" width="31" height="33">
                    <use xlinkHref="#icon-bookmark"></use>
                  </svg>
                  <span className="visually-hidden">
                    {isFavorite && isAuthorized === AuthorizationStatus.Authorized ? 'In bookmarks' : 'To bookmarks'}
                  </span>
                </button>
              </div>
              <div className="offer__rating rating">
                <div className="offer__stars rating__stars">
                  <span style={{ width: `${Math.round(currentOffer?.rating) * 20}%` }}></span>
                  <span className="visually-hidden">Rating</span>
                </div>
                <span className="offer__rating-value rating__value">{currentOffer?.rating}</span>
              </div>
              <ul className="offer__features">
                <li className="offer__feature offer__feature--entire">
                  {currentOffer?.type.charAt(0).toUpperCase() + currentOffer?.type.slice(1)}
                </li>
                <li className="offer__feature offer__feature--bedrooms">
                  {currentOffer?.bedrooms} {currentOffer?.bedrooms > 1 ? 'Bedrooms' : 'Bedroom'}
                </li>
                <li className="offer__feature offer__feature--adults">
                  Max {currentOffer?.maxAdults} {currentOffer?.maxAdults > 1 ? 'adults' : 'adult'}
                </li>
              </ul>
              <div className="offer__price">
                <b className="offer__price-value">&euro;{currentOffer?.price}</b>
                <span className="offer__price-text">&nbsp;night</span>
              </div>
              <div className="offer__inside">
                <h2 className="offer__inside-title">What&apos;s inside</h2>
                <ul className="offer__inside-list">
                  {currentOffer?.goods.map((good) => (
                    <li className="offer__inside-item" key={good}>
                      {good}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="offer__host">
                <h2 className="offer__host-title">Meet the host</h2>
                <div className="offer__host-user user">
                  <div className="offer__avatar-wrapper offer__avatar-wrapper--pro user__avatar-wrapper">
                    <img
                      className="offer__avatar user__avatar"
                      src={currentOffer?.host.avatarUrl}
                      width="74"
                      height="74"
                      alt="Host avatar"
                    />
                  </div>
                  <span className="offer__user-name">{currentOffer?.host.name}</span>
                  <span className="offer__user-status">{currentOffer?.host.isPro ? 'Pro' : 'New'}</span>
                </div>
                <div className="offer__description">
                  <p className="offer__text">
                    {currentOffer?.description}
                  </p>
                </div>
              </div>
              <section className="offer__reviews reviews">
                <ReviewsList reviewComments={sortReviewsByDate(currentReviews.slice(currentReviews.length - 10))}/>
                {isAuthorized === AuthorizationStatus.Authorized && (
                  <ReviewForm offerId={currentOffer?.id}/>
                )}
              </section>
            </div>
          </div>
          <section className="offer__map map">
            <Map city={currentOffer?.city} points={points} selectedPoint={selectedPoint} height='600px' width='1200px'/>
          </section>
        </section>
        <OffersNearby offersNearby={offersNearby}/>
      </main>
    </div>
  );
}
