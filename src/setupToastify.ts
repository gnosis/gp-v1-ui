import { toast } from 'react-toastify'

import { TOAST_NOTIFICATION_DURATION } from 'const'

toast.configure({
  position: toast.POSITION.BOTTOM_RIGHT,
  closeOnClick: false,
  autoClose: TOAST_NOTIFICATION_DURATION,
})

export { toast }
