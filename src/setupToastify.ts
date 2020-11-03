import styled from 'styled-components'
import { toast, ToastContainer as PreToastContainer } from 'react-toastify'

import greenCheck from 'assets/img/check-green.svg'
import { TOAST_NOTIFICATION_DURATION } from 'const'

const ToastContainer = styled(PreToastContainer).attrs({
  // custom props
  position: toast.POSITION.BOTTOM_RIGHT,
  closeOnClick: false,
  autoClose: TOAST_NOTIFICATION_DURATION,
})`
  z-index: 9999;
  transform: translate3d(0, 0, 999rem);
  position: fixed;
  padding: 0.4rem;
  width: 40rem;
  box-sizing: border-box;
  color: var(--color-background-pageWrapper);

  &.Toastify__toast-container--top-left {
    top: 1rem;
    left: 1rem;
  }

  &.Toastify__toast-container--top-center {
    top: 1rem;
    left: 50%;
    margin-left: -16rem;
  }

  &.Toastify__toast-container--top-right {
    top: 1rem;
    right: 1rem;
  }

  &.Toastify__toast-container--bottom-left {
    bottom: 1rem;
    left: 1rem;
  }

  .Toastify__toast-container--bottom-center {
    bottom: 1rem;
    left: 50%;
    margin-left: -16rem;
  }

  &.Toastify__toast-container--bottom-right {
    bottom: 1rem;
    right: 1rem;
  }

  @media only screen and (max-width: 736px) {
    width: 90vw; /* fallback */
    width: calc(100vw - 2rem);
    margin: auto;
    right: 0;
    bottom: 1rem;
    padding: 0;
    left: 0;

    &.Toastify__toast-container--top-left,
    &.Toastify__toast-container--top-center,
    &.Toastify__toast-container--top-right {
      top: 0;
    }

    &.Toastify__toast-container--bottom-left,
    &.Toastify__toast-container--bottom-center,
    &.Toastify__toast-container--bottom-right {
      bottom: 1rem;
    }

    &.Toastify__toast-container--rtl {
      right: 0;
      left: initial;
    }
  }

  .Toastify__toast {
    position: relative;
    min-height: 6.4rem;
    box-sizing: border-box;
    margin: 0 0 1.6rem;
    padding: 0 0.8rem 0 0;
    display: flex;
    justify-content: space-between;
    max-height: 80rem;
    overflow: hidden;
    font-family: var(--font-default);
    cursor: pointer;
    direction: ltr;
    background: var(--color-background-pageWrapper);
    color: var(--color-text-primary);
    box-shadow: 0 0 1rem 0 rgba(33, 48, 77, 0.1);
    border-radius: 0.6rem;
    font-size: 1.4rem;
    letter-spacing: 0;
  }

  .Toastify__toast--rtl {
    direction: rtl;
  }

  /* .Toastify__toast--default {} */

  .Toastify__toast--info::before {
    content: '';
    width: 0.6rem;
    height: auto;
    margin: 0 1rem 0 0;
    display: inline-block;
    background: #3498db;
  }

  .Toastify__toast--success {
    &::before {
      content: '';
      width: 0.6rem;
      height: auto;
      margin: 0 1rem 0 0;
      display: inline-block;
      background: #29a644;
      order: 1;
    }
    &::after {
      content: '';
      background: url(${greenCheck}) no-repeat center/contain;
      display: inline-block;
      height: 1.8rem;
      width: 1.8rem;
      order: 2;
      margin: auto;
    }
  }

  .Toastify__toast--warning::before {
    content: '';
    width: 0.6rem;
    height: auto;
    margin: 0 1rem 0 0;
    display: inline-block;
    background: #f1c40f;
  }

  .Toastify__toast--error {
    color: #e74c3c;
    &::before {
      content: '';
      width: 0.6rem;
      height: auto;
      margin: 0 1rem 0 0;
      display: inline-block;
      background: #e74c3c;
    }
  }

  .Toastify__toast-body {
    margin: auto 0;
    -ms-flex: 1;
    flex: 1;
    padding: 1.6rem 0 1.6rem 0.8rem;
    order: 3;
    line-height: 1.2;

    > div {
      line-height: 1.2;
    }
  }

  @media only screen and (max-width: 736px) {
    .Toastify__toast {
      margin-bottom: 1rem;
      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .Toastify__close-button {
    background: transparent;
    outline: none;
    border: none;
    padding: 0;
    cursor: pointer;
    opacity: 0.7;
    transition: 0.3s ease;
    align-self: flex-start;
    order: 5;
    color: #476480;
    font-weight: var(--font-weight-normal);
    font-size: 1.4rem;
    height: 100%;
    margin: auto 0 auto 1rem;

    &:hover {
      opacity: 1;
      background: transparent;
    }
  }

  .Toastify__close-button--default {
    color: #000;
    opacity: 0.3;
  }

  .Toastify__close-button:hover,
  .Toastify__close-button:focus {
    opacity: 1;
  }

  @keyframes Toastify__trackProgress {
    0% {
      transform: scaleX(1);
    }

    100% {
      transform: scaleX(0);
    }
  }

  .Toastify__progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 0.4rem;
    z-index: 9999;
    opacity: 0.7;
    background-color: rgba(47, 62, 78, 0.2);
    transform-origin: left;
  }

  .Toastify__progress-bar--animated {
    animation: Toastify__trackProgress linear 1 forwards;
  }

  .Toastify__progress-bar--controlled {
    transition: transform 0.2s;
  }

  .Toastify__progress-bar--rtl {
    right: 0;
    left: initial;
    transform-origin: right;
  }

  .Toastify__progress-bar--default {
    background: linear-gradient(to right, #4cd964, #5ac8fa, #007aff, #34aadc, #5856d6, #ff2d55);
  }

  @keyframes Toastify__bounceInRight {
    from,
    60%,
    75%,
    90%,
    to {
      animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    }

    from {
      opacity: 0;
      transform: translate3d(300rem, 0, 0);
    }

    60% {
      opacity: 1;
      transform: translate3d(-2.5rem, 0, 0);
    }

    75% {
      transform: translate3d(1rem, 0, 0);
    }

    90% {
      transform: translate3d(-0.5rem, 0, 0);
    }

    to {
      transform: none;
    }
  }

  @keyframes Toastify__bounceOutRight {
    20% {
      opacity: 1;
      transform: translate3d(-2rem, 0, 0);
    }

    to {
      opacity: 0;
      transform: translate3d(200rem, 0, 0);
    }
  }

  @keyframes Toastify__bounceInLeft {
    from,
    60%,
    75%,
    90%,
    to {
      animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    }

    0% {
      opacity: 0;
      transform: translate3d(-300rem, 0, 0);
    }

    60% {
      opacity: 1;
      transform: translate3d(2.5rem, 0, 0);
    }

    75% {
      transform: translate3d(-1rem, 0, 0);
    }

    90% {
      transform: translate3d(0.5rem, 0, 0);
    }

    to {
      transform: none;
    }
  }

  @keyframes Toastify__bounceOutLeft {
    20% {
      opacity: 1;
      transform: translate3d(2rem, 0, 0);
    }

    to {
      opacity: 0;
      transform: translate3d(-200rem, 0, 0);
    }
  }

  @keyframes Toastify__bounceInUp {
    from,
    60%,
    75%,
    90%,
    to {
      animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    }

    from {
      opacity: 0;
      transform: translate3d(0, 300rem, 0);
    }

    60% {
      opacity: 1;
      transform: translate3d(0, -2rem, 0);
    }

    75% {
      transform: translate3d(0, 1rem, 0);
    }

    90% {
      transform: translate3d(0, -0.5rem, 0);
    }

    to {
      transform: translate3d(0, 0, 0);
    }
  }

  @keyframes Toastify__bounceOutUp {
    20% {
      transform: translate3d(0, -1rem, 0);
    }

    40%,
    45% {
      opacity: 1;
      transform: translate3d(0, 2rem, 0);
    }

    to {
      opacity: 0;
      transform: translate3d(0, -200rem, 0);
    }
  }

  @keyframes Toastify__bounceInDown {
    from,
    60%,
    75%,
    90%,
    to {
      animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    }

    0% {
      opacity: 0;
      transform: translate3d(0, -300rem, 0);
    }

    60% {
      opacity: 1;
      transform: translate3d(0, 2.5rem, 0);
    }

    75% {
      transform: translate3d(0, -1rem, 0);
    }

    90% {
      transform: translate3d(0, 0.5rem, 0);
    }

    to {
      transform: none;
    }
  }

  @keyframes Toastify__bounceOutDown {
    20% {
      transform: translate3d(0, 1rem, 0);
    }

    40%,
    45% {
      opacity: 1;
      transform: translate3d(0, -2rem, 0);
    }

    to {
      opacity: 0;
      transform: translate3d(0, 200rem, 0);
    }
  }

  .Toastify__bounce-enter--top-left,
  .Toastify__bounce-enter--bottom-left {
    animation-name: Toastify__bounceInLeft;
  }

  .Toastify__bounce-enter--top-right,
  .Toastify__bounce-enter--bottom-right {
    animation-name: Toastify__bounceInRight;
  }

  .Toastify__bounce-enter--top-center {
    animation-name: Toastify__bounceInDown;
  }

  .Toastify__bounce-enter--bottom-center {
    animation-name: Toastify__bounceInUp;
  }

  .Toastify__bounce-exit--top-left,
  .Toastify__bounce-exit--bottom-left {
    animation-name: Toastify__bounceOutLeft;
  }

  .Toastify__bounce-exit--top-right,
  .Toastify__bounce-exit--bottom-right {
    animation-name: Toastify__bounceOutRight;
  }

  .Toastify__bounce-exit--top-center {
    animation-name: Toastify__bounceOutUp;
  }

  .Toastify__bounce-exit--bottom-center {
    animation-name: Toastify__bounceOutDown;
  }

  @keyframes Toastify__zoomIn {
    from {
      opacity: 0;
      transform: scale3d(0.3, 0.3, 0.3);
    }

    50% {
      opacity: 1;
    }
  }

  @keyframes Toastify__zoomOut {
    from {
      opacity: 1;
    }

    50% {
      opacity: 0;
      transform: scale3d(0.3, 0.3, 0.3);
    }

    to {
      opacity: 0;
    }
  }

  .Toastify__zoom-enter {
    animation-name: Toastify__zoomIn;
  }

  .Toastify__zoom-exit {
    animation-name: Toastify__zoomOut;
  }

  @keyframes Toastify__flipIn {
    from {
      transform: perspective(40rem) rotate3d(1, 0, 0, 90deg);
      animation-timing-function: ease-in;
      opacity: 0;
    }

    40% {
      transform: perspective(40rem) rotate3d(1, 0, 0, -20deg);
      animation-timing-function: ease-in;
    }

    60% {
      transform: perspective(40rem) rotate3d(1, 0, 0, 10deg);
      opacity: 1;
    }

    80% {
      transform: perspective(40rem) rotate3d(1, 0, 0, -5deg);
    }

    to {
      transform: perspective(40rem);
    }
  }

  @keyframes Toastify__flipOut {
    from {
      transform: perspective(40rem);
    }

    30% {
      transform: perspective(40rem) rotate3d(1, 0, 0, -20deg);
      opacity: 1;
    }

    to {
      transform: perspective(40rem) rotate3d(1, 0, 0, 90deg);
      opacity: 0;
    }
  }

  .Toastify__flip-enter {
    animation-name: Toastify__flipIn;
  }

  .Toastify__flip-exit {
    animation-name: Toastify__flipOut;
  }

  @keyframes Toastify__slideInRight {
    from {
      transform: translate3d(110%, 0, 0);
      visibility: visible;
    }

    to {
      transform: translate3d(0, 0, 0);
    }
  }

  @keyframes Toastify__slideInLeft {
    from {
      transform: translate3d(-110%, 0, 0);
      visibility: visible;
    }

    to {
      transform: translate3d(0, 0, 0);
    }
  }

  @keyframes Toastify__slideInUp {
    from {
      transform: translate3d(0, 110%, 0);
      visibility: visible;
    }

    to {
      transform: translate3d(0, 0, 0);
    }
  }

  @keyframes Toastify__slideInDown {
    from {
      transform: translate3d(0, -110%, 0);
      visibility: visible;
    }

    to {
      transform: translate3d(0, 0, 0);
    }
  }

  @keyframes Toastify__slideOutRight {
    from {
      transform: translate3d(0, 0, 0);
    }

    to {
      visibility: hidden;
      transform: translate3d(110%, 0, 0);
    }
  }

  @keyframes Toastify__slideOutLeft {
    from {
      transform: translate3d(0, 0, 0);
    }

    to {
      visibility: hidden;
      transform: translate3d(-110%, 0, 0);
    }
  }

  @keyframes Toastify__slideOutDown {
    from {
      transform: translate3d(0, 0, 0);
    }

    to {
      visibility: hidden;
      transform: translate3d(0, 50rem, 0);
    }
  }

  @keyframes Toastify__slideOutUp {
    from {
      transform: translate3d(0, 0, 0);
    }

    to {
      visibility: hidden;
      transform: translate3d(0, -50rem, 0);
    }
  }

  .Toastify__slide-enter--top-left,
  .Toastify__slide-enter--bottom-left {
    animation-name: Toastify__slideInLeft;
  }

  .Toastify__slide-enter--top-right,
  .Toastify__slide-enter--bottom-right {
    animation-name: Toastify__slideInRight;
  }

  .Toastify__slide-enter--top-center {
    animation-name: Toastify__slideInDown;
  }

  .Toastify__slide-enter--bottom-center {
    animation-name: Toastify__slideInUp;
  }

  .Toastify__slide-exit--top-left,
  .Toastify__slide-exit--bottom-left {
    animation-name: Toastify__slideOutLeft;
  }

  .Toastify__slide-exit--top-right,
  .Toastify__slide-exit--bottom-right {
    animation-name: Toastify__slideOutRight;
  }

  .Toastify__slide-exit--top-center {
    animation-name: Toastify__slideOutUp;
  }

  .Toastify__slide-exit--bottom-center {
    animation-name: Toastify__slideOutDown;
  }
`

export { ToastContainer, toast }
