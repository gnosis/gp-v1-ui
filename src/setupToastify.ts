import 'react-toastify/dist/ReactToastify.min.css'
import { toast } from 'react-toastify'

toast.configure({ position: toast.POSITION.BOTTOM_RIGHT, closeOnClick: false, autoClose: 10000 })

export { toast }
