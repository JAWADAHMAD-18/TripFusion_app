import { Alert, Platform } from 'react-native';

const DEFAULT_CANCEL_REASON = 'Cancelled by user';

export function promptCancelReason(onSubmit: (reason: string) => void): void {
  if (Platform.OS === 'ios') {
    Alert.prompt(
      'Cancellation reason',
      'Please tell us why you are cancelling this booking.',
      [
        { text: 'Go back', style: 'cancel' },
        {
          text: 'Submit',
          style: 'destructive',
          onPress: (value) => {
            const reason = value?.trim();
            if (reason) onSubmit(reason);
          },
        },
      ],
      'plain-text',
    );
    return;
  }

  Alert.alert(
    'Cancellation reason',
    'Your booking will be cancelled.',
    [
      { text: 'Go back', style: 'cancel' },
      {
        text: 'Confirm cancel',
        style: 'destructive',
        onPress: () => onSubmit(DEFAULT_CANCEL_REASON),
      },
    ],
  );
}

export function confirmCancelBooking(
  onConfirm: (reason: string) => void,
): void {
  Alert.alert(
    'Cancel Booking',
    'Are you sure you want to cancel this booking?',
    [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: () => promptCancelReason(onConfirm),
      },
    ],
  );
}
