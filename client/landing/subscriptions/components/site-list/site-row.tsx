import { Gridicon } from '@automattic/components';
import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TimeSince from 'calypso/components/time-since';
import { SiteSettingsPopover } from '../settings';
import { SiteIcon } from '../site-icon';
import type { SiteSubscription } from '@automattic/data-stores/src/reader/types';

const useDeliveryFrequencyLabel = ( deliveryFrequencyValue?: Reader.EmailDeliveryFrequency ) => {
	const translate = useTranslate();

	const deliveryFrequencyLabels = useMemo(
		() => ( {
			daily: translate( 'Daily' ),
			weekly: translate( 'Weekly' ),
			instantly: translate( 'Instantly' ),
		} ),
		[ translate ]
	);

	return (
		deliveryFrequencyLabels[ deliveryFrequencyValue as Reader.EmailDeliveryFrequency ] ??
		translate( 'Paused' )
	);
};

const RedCross = () => <Gridicon icon="cross" size={ 16 } className="red" />;

const GreenCheck = () => <Gridicon icon="checkmark" size={ 16 } className="green" />;

const SelectedNewPostDeliveryMethods = ( {
	isEmailMeNewPostsSelected,
	isNotifyMeOfNewPostsSelected,
}: {
	isEmailMeNewPostsSelected: boolean;
	isNotifyMeOfNewPostsSelected: boolean;
} ) => {
	const translate = useTranslate();

	if ( ! isEmailMeNewPostsSelected && ! isNotifyMeOfNewPostsSelected ) {
		return <RedCross />;
	}

	const emailDelivery = isEmailMeNewPostsSelected ? translate( 'Email' ) : null;
	const notificationDelivery = isNotifyMeOfNewPostsSelected ? translate( 'Notifications' ) : null;
	const selectedNewPostDeliveryMethods = [ emailDelivery, notificationDelivery ]
		.filter( Boolean )
		.join( ', ' );
	return <>{ selectedNewPostDeliveryMethods }</>;
};

export default function SiteRow( {
	blog_ID,
	name,
	site_icon,
	URL: url,
	date_subscribed,
	delivery_methods,
	is_wpforteams_site,
	is_paid_subscription,
}: SiteSubscription ) {
	const translate = useTranslate();
	const hostname = useMemo( () => {
		try {
			return new URL( url ).hostname;
		} catch ( e ) {
			return '';
		}
	}, [ url ] );
	const { isLoggedIn } = SubscriptionManager.useIsLoggedIn();
	const deliveryFrequencyLabel = useDeliveryFrequencyLabel(
		delivery_methods.email?.post_delivery_frequency
	);
	const { mutate: updateNotifyMeOfNewPosts, isLoading: updatingNotifyMeOfNewPosts } =
		SubscriptionManager.useSiteNotifyMeOfNewPostsMutation();
	const { mutate: updateEmailMeNewPosts, isLoading: updatingEmailMeNewPosts } =
		SubscriptionManager.useSiteEmailMeNewPostsMutation();
	const { mutate: updateDeliveryFrequency, isLoading: updatingFrequency } =
		SubscriptionManager.useSiteDeliveryFrequencyMutation();
	const { mutate: updateEmailMeNewComments, isLoading: updatingEmailMeNewComments } =
		SubscriptionManager.useSiteEmailMeNewCommentsMutation();
	const { mutate: unsubscribe, isLoading: unsubscribing } =
		SubscriptionManager.useSiteUnsubscribeMutation();

	const navigate = useNavigate();

	const individualPagePath = useMemo( () => {
		return `/subscriptions/site/${ blog_ID }`;
	}, [ blog_ID ] );

	const navigateToIndividualSubscriptionPage = ( event: React.MouseEvent ) => {
		event.preventDefault();
		navigate( individualPagePath );
	};

	return (
		<li className="row" role="row">
			<span className="title-box" role="cell">
				<a href={ individualPagePath } onClick={ navigateToIndividualSubscriptionPage }>
					<SiteIcon iconUrl={ site_icon } size={ 48 } siteName={ name } />
				</a>
				<span className="title-column">
					<a href={ individualPagePath } onClick={ navigateToIndividualSubscriptionPage }>
						<span className="name">
							{ name }
							{ !! is_wpforteams_site && <span className="p2-label">P2</span> }
							{ !! is_paid_subscription && (
								<span className="paid-label">
									{ translate( 'Paid', { context: 'Label for a paid subscription plan' } ) }
								</span>
							) }
						</span>
					</a>
					<a { ...( url && { href: url } ) } rel="noreferrer noopener" target="_blank">
						<span className="url">{ hostname }</span>
					</a>
				</span>
			</span>
			<span className="date" role="cell">
				<TimeSince
					date={
						( date_subscribed.valueOf() ? date_subscribed : new Date( 0 ) ).toISOString?.() ??
						date_subscribed
					}
				/>
			</span>
			{ isLoggedIn && (
				<span className="new-posts" role="cell">
					<SelectedNewPostDeliveryMethods
						isEmailMeNewPostsSelected={ !! delivery_methods.email?.send_posts }
						isNotifyMeOfNewPostsSelected={ !! delivery_methods.notification?.send_posts }
					/>
				</span>
			) }
			{ isLoggedIn && (
				<span className="new-comments" role="cell">
					{ delivery_methods.email?.send_comments ? <GreenCheck /> : <RedCross /> }
				</span>
			) }
			<span className="email-frequency" role="cell">
				{ deliveryFrequencyLabel }
			</span>
			<span className="actions" role="cell">
				<SiteSettingsPopover
					// NotifyMeOfNewPosts
					notifyMeOfNewPosts={ !! delivery_methods.notification?.send_posts }
					onNotifyMeOfNewPostsChange={ ( send_posts ) =>
						updateNotifyMeOfNewPosts( { blog_id: blog_ID, send_posts } )
					}
					updatingNotifyMeOfNewPosts={ updatingNotifyMeOfNewPosts }
					// EmailMeNewPosts
					emailMeNewPosts={ !! delivery_methods.email?.send_posts }
					updatingEmailMeNewPosts={ updatingEmailMeNewPosts }
					onEmailMeNewPostsChange={ ( send_posts ) =>
						updateEmailMeNewPosts( { blog_id: blog_ID, send_posts } )
					}
					// DeliveryFrequency
					deliveryFrequency={
						delivery_methods.email?.post_delivery_frequency ??
						Reader.EmailDeliveryFrequency.Instantly
					}
					onDeliveryFrequencyChange={ ( delivery_frequency ) =>
						updateDeliveryFrequency( { blog_id: blog_ID, delivery_frequency } )
					}
					updatingFrequency={ updatingFrequency }
					// EmailMeNewComments
					emailMeNewComments={ !! delivery_methods.email?.send_comments }
					onEmailMeNewCommentsChange={ ( send_comments ) =>
						updateEmailMeNewComments( { blog_id: blog_ID, send_comments } )
					}
					updatingEmailMeNewComments={ updatingEmailMeNewComments }
					onUnsubscribe={ () => unsubscribe( { blog_id: blog_ID, url: url } ) }
					unsubscribing={ unsubscribing }
				/>
			</span>
		</li>
	);
}
