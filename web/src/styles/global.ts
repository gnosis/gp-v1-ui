import { createGlobalStyle } from 'styled-components'
import fontFace from './fonts'
import variables from './variables'
import checkWhite from 'assets/img/check-white.svg'
import greenCheck from 'assets/img/check-green.svg'
import { MEDIA } from 'const'

const GlobalStyles = createGlobalStyle`
  // global root variables
  ${variables}
  // Import font faces
  ${fontFace}

  html, body {  
    width: 100%;
    min-height: 100vh;
    margin: 0;
    font-size: 62.5%;
    line-height: 10px;
    font-family: var(--font-default);
    background-color: var(--color-background);
    color: var(--color-text-primary);
    box-sizing: border-box;
    scroll-behavior: smooth;
    text-rendering: geometricPrecision;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  *::selection {
    background: var(--color-background-selection); /* WebKit/Blink Browsers */
    color: var(--color-text-selection);
  }
  *::-moz-selection {
    background: var(--color-background-selection); /* Gecko Browsers */
  }
  *::-webkit-selection {
    background: var(--color-background-selection); /* Chrome Browsers */
  }

  *::-moz-placeholder {
    line-height: revert;
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }
  a {   
    text-decoration: underline;
    cursor: pointer;
      &:link, 
      &:visited {
        color: var(--color-text-active);
      }
  }

  h1, h2, h3 {
    margin: 0;
    margin: 0.5rem 0;
  }
  h1 {
    font-size: 3rem;
  }
  h2 {
    font-size: 2rem;
  }

  #root {
    height: 100%;
    font-size: 1.3rem;
  }

  button {
    background-color: var(--color-background-CTA);
    color: var(--color-text-CTA);
    font-family: inherit;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    transition-property: color, background-color, border-color, opacity;
    border: 0;
    font-weight: var(--font-weight-bold);
    outline: 0;

    &:hover {
      background-color: var(--color-background-button-hover);
      color: var(--color-text-button-hover);
    }

    &:disabled,
    &[disabled]{
      &:hover {
        background-color: var(--color-background-button-disabled-hover);
      }
      opacity: .35;
      pointer-events: none;
    }
    &.success {
      border-color: var(--color-button-success);
      color: var(--color-button-success);
      :hover {
        background-color: var(--color-button-success);
        border-color: var(--color-button-success);
        color: var(--color-background-pageWrapper);
      }
    }
    &.danger {
      border-color: var(--color-button-danger);
      color: var(--color-button-danger);
      :hover {
        background-color: var(--color-button-danger);
        border-color: var(--color-button-danger);
        color: var(--color-background-pageWrapper);
      }
    }
    &.secondary {
      border-color: var(--color-button-secondary);
      color: var(--color-button-secondary);
      :hover {
        border-color: black;
        color: black;
      }
    }
    &.big {
      font-size: 1.2rem;
      padding: 0.65rem 1rem;
    }
    &.small {
      font-size: 0.6rem;
      padding: 0.3rem 0.5rem;
    }
  }

  input {
    background-color: var(--color-background-pageWrapper);
    border: 0.11rem solid transparent;
    border-radius: var(--border-radius);
    color: var(--color-text-primary);
    outline: none;
    font-family: inherit;
    font-size: 0.75rem;
    font-weight: var(--font-weight-bold);
    padding: 0.65rem;
    margin: 0.4rem 0.85rem;
    width: 100%;
    line-height: 1;
    
    &::placeholder {
      color: inherit;
      font-size: inherit;
    }
    
    &:focus::placeholder {
      color: transparent;
    }
    
    &[type=checkbox] {
      margin: 0 auto;
      background: transparent;
      appearance: none;
      border: 0.2rem solid var(--color-text-secondary);
      border-radius: 0.3rem;
      box-sizing: border-box;
      height: 1.4rem;
      width: 1.4rem;
      padding: 0;
      cursor: pointer;
      outline: 0;
      
        &:checked {
          background: var(--color-text-active) url(${checkWhite}) no-repeat center/.85rem;
          border: 0.2rem solid transparent;
        }
    }

    &:focus {
      border-color: var(--color-text-primary);
    }
    &:disabled {
      opacity: .8;
    }
  }
  
  .noScroll {
    overflow: hidden;
  }

  .not-implemented {
    display: none !important
  }

  /* Toastify custom styling */
  .Toastify__toast-container {
    z-index: 9999;
    transform: translate3d(0, 0, 999rem);
    position: fixed;
    padding: 0.4rem;
    width: 40rem;
    box-sizing: border-box;
    color: var(--color-background-pageWrapper);
  }

  .Toastify__toast-container--top-left {
    top: 1rem;
    left: 1rem;
  }

  .Toastify__toast-container--top-center {
    top: 1rem;
    left: 50%;
    margin-left: -16rem;
  }

  .Toastify__toast-container--top-right {
    top: 1rem;
    right: 1rem;
  }

  .Toastify__toast-container--bottom-left {
    bottom: 1rem;
    left: 1rem;
  }

  .Toastify__toast-container--bottom-center {
    bottom: 1rem;
    left: 50%;
    margin-left: -16rem;
  }

  .Toastify__toast-container--bottom-right {
    bottom: 1rem;
    right: 1rem;
  }

  @media only screen and (max-width: 736px) {
    .Toastify__toast-container {
      width: 90vw; // fallback
      width: calc(100vw - 2rem);
      margin: auto;
      right: 0;
      bottom: 1rem;
      padding: 0;
      left: 0;
    }

    .Toastify__toast-container--top-left,
    .Toastify__toast-container--top-center,
    .Toastify__toast-container--top-right {
      top: 0;
    }

    .Toastify__toast-container--bottom-left,
    .Toastify__toast-container--bottom-center,
    .Toastify__toast-container--bottom-right {
      bottom: 1rem;
    }

    .Toastify__toast-container--rtl {
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

  // .Toastify__toast--default {
  // }

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
      transform: translate3d(.5rem, 0, 0);
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
      transform: translate3d(0, -.5rem, 0);
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
      transform: translate3d(0, .5rem, 0);
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
  /* END Toastify custom styling */
  
  // Web3Connect styling
  // SUUUUPER lame and hacky, but don't feel like changing the Web3Conect code base to allow style passing
  // or am i missing something?
  #WEB3_CONNECT_MODAL_ID > div > div > div:last-child {
      display: flex;
      width: 100%;
      max-width: 60rem;
      background: var(--color-background-pageWrapper);
      flex-flow: column wrap;
      margin: 0;
      padding: 0 1.6rem 1.6rem;
      
      &::before {
        content: "Connect A Wallet";
        width: 100%;
        display: block;
        font-size: 1.6rem;
        line-height: 1;
        padding: 2.4rem 0;
        box-sizing: border-box;
        color: var(--color-text-primary);
        font-weight: var(--font-weight-bold);
      }
    
    // Individual outer container
    > div {
      background: var(--color-background-pageWrapper);
      border-radius: var(--border-radius);
      color: var(--color-text-primary);
      display: flex;
      flex-flow: row wrap;
      flex: 1 1 100%;
      border: 0;
    }
    
    // Individual inner container
    > div > div {
      background: var(--color-background-pageWrapper);
      display: flex;
      align-items: center;
      justify-content: flex-start;
      margin: 0;
      opacity: 1;
      width: 100%;
      outline: none;
      border-radius: 1.2rem;
      padding: 1rem;
      border: 0.1rem solid var(--color-background-banner);
      flex-flow: row nowrap;
      transition: border .2s ease-in-out;
      min-height: 5.6rem;
      
        &:hover {
          border: 0.1rem solid var(--color-text-active);
        }
    }
    
    // Provider image
    > div > div > div:nth-of-type(1) {
      background: 0;
      box-shadow: none;
      width: 2.4rem;
      height: 2.4rem;
      display: block;
      overflow: visible;
        > img {
          display: block;
          width: 2.4rem;
          height: 2.4rem;
          object-fit: contain;
        }
    }
    
    // Client name
    > div > div > div:nth-of-type(2) {
      font-size: 1.5rem;
      text-align: left;
      padding: 0 1.2rem;
      margin: 0;
      color: var(--color-text-primary);
    }
    
    // Client description
    > div > div > div:nth-of-type(3) {
      font-size: 1.5rem;
      color: var(--color-text-primary);
      white-space: nowrap;
    }
  }
  // End WEB3 connect
  
  // Start WalletConnect Modal
  #walletconnect-qrcode-modal {
    .walletconnect-modal__headerLogo {
      max-width: 24rem;
      height: auto;
      margin: 2.4rem auto;
    }
    
    .walletconnect-qrcode__image {
      height: calc(100vh - 14rem);
      padding: 1rem;
      max-height: 40rem;
    }
  }
  #walletconnect-qrcode-text {
    font-size: 1.8rem;
    line-height: 1.2;
    padding: 0 2rem;
    color: var(--color-text-primary);
  }
  // End WalletConnect Modal

  /* Hack to fix Modali screen flash */
  .modali-overlay {
    display: none
  }

  .modali-wrapper::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    content: "";
    background-color: var(--color-background-modali);
  }

  /* Hack to not darken view further when two modali are open */
  .modali-wrapper:nth-last-of-type(n+3)::before {
    display: none;
  }

  /* End hack */
  
  .modali-open .modali-overlay {
    background-color: var(--color-background-modali);
    opacity: 1;
  }
  
  .modali-open .modali-wrapper-centered .modali {
    background: var(--color-background-pageWrapper);
    box-shadow: 0 .2rem .4rem 0 rgba(0,0,0,0.14);
    border-radius: .6rem;
    border: 0;
    margin: 0 auto;
    
    .modali-header {
      height: 5.6rem;
      padding: 0 1.6rem;
      box-sizing: border-box;
      letter-spacing: 0;
      font-size: 1.6rem;
      text-align: left;
      color: var(--color-text-primary);
      margin: 0;
      display: flex;
      align-items: center;
      font-family: var(--font-default);
      font-weight: var(--font-weight-regular);
      border-bottom: 0.1rem solid var(--color-background-banner);
    }
    
    .modali-header .modali-title {
      font-size: inherit;
      font-weight: inherit;
      line-height: 1;
    }
    
    .modali-header .modali-close-button {
      background: transparent;
      font-size: 4rem;
      line-height: 1;
      color: var(--color-modali-close);
      font-weight: normal;
      opacity: .5;
      padding: 0;
      margin: auto 0 auto auto;
      
        &:hover {
          opacity: 1;
        }
    }
    
    .modali-body {
      font-size: 1.4rem;
      line-height: 1.3;
      background: inherit;
      color: var(--color-text-primary);
    }
    
    .modali-footer {
      margin: 1.6rem auto 0;
      height: 5.6rem;
      border-top: 0.1rem solid var(--color-background-banner);
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 1.6rem;
      box-sizing: border-box;

      .modali-button.modali-button-default, .modali-button.modali-button-cancel {
        margin: 0;
        border-radius: 0.6rem;
        outline: 0;
        height: 3.6rem;
        box-sizing: border-box;
        letter-spacing: 0.03rem;
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        text-transform: uppercase;
        background: var(--color-background-CTA);
        color: var(--color-text-CTA);
        font-weight: var(--font-weight-bold);
        font-size: 1.4rem;
        
        &:hover {
          background-color: var(--color-background-button-hover);
          color: var(--color-text-button-hover);
        }
      }
      
      .modali-button.modali-button-default {
        border-radius: 0.6rem;
        min-width: 14rem;
        padding: 0 1.6rem;
      }

      .modali-button.modali-button-cancel {
        background: transparent;
        color: var(--color-text-active);
      }
    }
  }
  
  // Heavier specification of the selector to ensure override from global.ts
  // Ideally take out the modali default injected styles and only load from our end.
  body.modali-open .modali.modali-size-large {
    width: 80vw;
    max-width: initial;
    min-width: initial;
    max-height: 100%;
      @media (min-width: 500px) {
          min-width: initial !important;
      }
      @media ${MEDIA.mobile},
      @media ${MEDIA.tablet} {
        width: 100%;
      }
  }
  
  body.modali-open .modali-wrapper-centered {
    top: 0!important;
  }
  
  body.modali-open .modali-body-style {
    padding: 0;
  }
`

export default GlobalStyles
