export const TOUR_STEP_IDS = {
  // Navigation (desktop sidebar / mobile navbar)
  SIDEBAR_NEW_TRAVEL: 'sidebar-new-travel',
  SIDEBAR_HOME: 'sidebar-home',
  SIDEBAR_PROFILE: 'sidebar-profile',
  SIDEBAR_ACCOUNT: 'sidebar-account',
  NAVBAR_NEW_TRAVEL: 'navbar-new-travel',
  NAVBAR_HOME: 'navbar-home',
  NAVBAR_PROFILE: 'navbar-profile',

  // Home
  HOME_DIRECTION: 'home-direction',
  HOME_FEED: 'home-feed',

  // New travel form
  TRAVEL_FORM_ORIGIN: 'travel-form-origin',
  TRAVEL_FORM_DESTINATION: 'travel-form-destination',
  TRAVEL_FORM_SWAP: 'travel-form-swap',
  TRAVEL_FORM_DATE: 'travel-form-date',
  TRAVEL_FORM_TIME: 'travel-form-time',
  TRAVEL_FORM_SEATS: 'travel-form-seats',
  TRAVEL_FORM_ORIGIN_MAP: 'travel-form-origin-map',
  TRAVEL_FORM_DESTINATION_MAP: 'travel-form-destination-map',
  TRAVEL_FORM_DATE_INPUT: 'travel-form-date-input',
  TRAVEL_FORM_TIME_INPUT: 'travel-form-time-input',
  TRAVEL_FORM_SEATS_MINUS: 'travel-form-seats-minus',
  TRAVEL_FORM_SEATS_PLUS: 'travel-form-seats-plus',
  TRAVEL_FORM_PUBLISH_BUTTON: 'travel-form-publish-button',

  // Vehicle form
  VEHICLE_FORM_COLOR: 'vehicle-form-color',
  VEHICLE_FORM_PLATE: 'vehicle-form-plate',
  VEHICLE_FORM_SEATS: 'vehicle-form-seats',
  VEHICLE_FORM_PRICE: 'vehicle-form-price',
  VEHICLE_FORM_ROUTE: 'vehicle-form-route',
  VEHICLE_FORM_SAVE: 'vehicle-form-save',

  // Driver onboarding
  ROLE_SELECTOR_OFFER: 'role-selector-offer',
  DIALOG_DRIVER: 'dialog-driver',
  DIALOG_DRIVER_SUBMIT: 'dialog-driver-submit',
  DIALOG_DRIVER_CONFIRMATION: 'dialog-driver-confirmation',
  OFFER_FORM_ROUTE: 'offer-form-route',
  OFFER_FORM_CONTRIBUTION: 'offer-form-contribution',

  // Profile
  PROFILE_HEADER: 'profile-header',
  PROFILE_EDIT_TAG: 'profile-edit-tag',
  PROFILE_STATS: 'profile-stats',
  PROFILE_LOCATIONS: 'profile-locations',
  PROFILE_SUPPORT: 'profile-support',
} as const;

export const TOUR_STORAGE_KEYS = {
  ONBOARDING_LEGACY: 'carpool_onboarding_completed',
  WELCOME: 'carpool_welcome_seen',
  HOME: 'carpool_home_tour_seen',
  PROFILE: 'carpool_profile_tour_seen',
  PASSENGER: 'carpool_passenger_tour_seen',
  OFFER: 'carpool_offer_tour_seen',
  TRAVEL_FORM: 'carpool_travel_tour_seen',
  DRIVER_ONBOARDING: 'carpool_driver_onboarding_seen',
  DRIVER_ONBOARDING_PENDING: 'carpool_driver_tour_pending',
  DRIVER_PUBLISH: 'carpool_driver_publish_tour_seen',
} as const;

export const TOUR_GATES = {
  welcome: TOUR_STORAGE_KEYS.WELCOME,
} as const;

export type TourGateName = keyof typeof TOUR_GATES;
