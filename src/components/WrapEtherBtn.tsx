import React from 'react'
// import styled from 'styled-components'
// import { useNumberInput } from 'components/TradeWidget/useNumberInput'
// import { ModalBodyWrapper } from 'components/Modal'
// import { DEFAULT_MODAL_OPTIONS, ModalBodyWrapper } from 'components/Modal'
// import Modali, { useModali } from 'modali'
// import { InputBox } from 'components/InputBox'
// import { useForm } from 'react-hook-form'
// import { DEFAULT_PRECISION, formatAmountFull } from '@gnosis.pm/dex-js'
// import BN from 'bn.js'
// import { validatePositiveConstructor, validInputPattern } from 'utils'
// import { TooltipWrapper } from './Tooltip'
//
// export const INPUT_ID_WRAP_ETH_AMOUNT = 'etherAmount'
//
// const WrapEtherModalWrapper = styled(ModalBodyWrapper)`
//   > div {
//     margin: 3rem 1.5rem;

//     ${InputBox} {
//       position: relative;
//       display: flex;
//       flex-flow: row wrap;

//       i {
//         position: absolute;
//         right: 1rem;
//         top: 0;
//         bottom: 0;
//         margin: 0;
//         color: #476481;
//         letter-spacing: -0.05rem;
//         text-align: right;
//         font-family: var(--font-default);
//         font-weight: var(--font-weight-bold);
//         font-size: 1.2rem;
//         font-style: normal;
//         display: flex;
//         justify-content: center;
//         align-items: center;
//       }
//     }
//   }

//   .error {
//     color: red;
//   }

//   b {
//     font-size: 1.3rem;
//     color: #2f3e4e;
//     margin: 0 1.6rem 0 0;
//     margin-bottom: 0.5rem;
//     padding-left: -0.5;
//     display: block;
//   }

//   a {
//     color: rgb(33, 141, 255);
//   }
// `

interface WrapUnwrapEtherBtnProps {
  wrap: boolean
  label?: string
  className?: string
}

export type WrapEtherBtnProps = Omit<WrapUnwrapEtherBtnProps, 'wrap'>

const WrapUnwrapEtherBtn: React.FC<WrapUnwrapEtherBtnProps> = (props: WrapUnwrapEtherBtnProps) => {
  const { wrap, label, className } = props
  return (
    <button type="button" className={className} onClick={(): void => alert('Wrap: ' + wrap)}>
      {label || (wrap ? 'Wrap Ether' : 'Unwrap Ether')}
    </button>
  )
}

export const WrapEtherBtn: React.FC<WrapEtherBtnProps> = (props: WrapEtherBtnProps) => (
  <WrapUnwrapEtherBtn wrap={true} {...props} />
)

export const UnwrapEtherBtn: React.FC<WrapEtherBtnProps> = (props: WrapEtherBtnProps) => (
  <WrapUnwrapEtherBtn wrap={false} {...props} />
)

// export const WrapEtherBtn: React.FC = () => {
//   // const [isWrapEtherModalVisible, showWrapEtherModal] = useSafeState(false)
//   const { register, errors, setValue } = useForm()
//   const wrapEtherError = errors[INPUT_ID_WRAP_ETH_AMOUNT]

//   // const [wethAmountToWrap, setWethAmountToWrap] = useSafeState('0')
//   // const {
//   //   onKeyPress: onKeyPressEtherAmount,
//   //   enforcePrecision: enforcePrecisionEtherAmount,
//   //   removeExcessZeros: removeExcessZerosEtherAmount,
//   // } = useNumberInput({
//   //   inputId: INPUT_ID_WRAP_ETH_AMOUNT,
//   //   precision: DEFAULT_PRECISION,
//   })

//   // TODO: Get balance in another PR
//   const availableBalanceInEther = new BN('1234567800000000000')

//   const [modalHook, toggleModal] = useModali({
//     ...DEFAULT_MODAL_OPTIONS,
//     title: 'Wrap Ether',
//     message: (
//       <WrapEtherModalWrapper>
//         <div>
//           <b>Available Ether</b>
//           <div>
//             <a
//               onClick={(): void => setValue(INPUT_ID_WRAP_ETH_AMOUNT, formatAmountFull(availableBalanceInEther), true)}
//             >
//               {formatAmountFull({ amount: availableBalanceInEther, precision: DEFAULT_PRECISION }) || ''} ETH
//             </a>
//           </div>
//         </div>
//         <div>
//           <b>Amount to Wrap</b>
//           <div>
//             <InputBox>
//               <i>ETH</i>
//               <input
//                 type="text"
//                 name={INPUT_ID_WRAP_ETH_AMOUNT}
//                 // value={wethAmountToWrap}
//                 onChange={enforcePrecisionEtherAmount}
//                 // onChange={(e: ChangeEvent<HTMLInputElement>): void => setWethAmountToWrap(e.target.value)}
//                 placeholder="0"
//                 autoFocus
//                 required
//                 ref={register({
//                   pattern: { value: validInputPattern, message: 'Invalid amount' },
//                   validate: { positive: validatePositiveConstructor('Invalid amount') },
//                   required: 'The amount is required',
//                   min: 0,
//                 })}
//                 // onFocus={(e): void => e.target.select()}
//                 // onKeyPress={onKeyPressEtherAmount}
//                 // onBlur={removeExcessZerosEtherAmount}
//               />
//             </InputBox>
//           </div>
//           {wrapEtherError && <p className="error">Invalid amount</p>}
//         </div>
//       </WrapEtherModalWrapper>
//     ),
//     buttons: [
//       <Modali.Button label="Cancel" key="no" isStyleCancel onClick={(): void => toggleModal()} />,
//       <Modali.Button label="Continue" key="yes" isStyleDefault onClick={(): void => toggleModal()} />,
//     ],
//   })

//   return (
//     <>
//       <TooltipWrapper
//         as="button"
//         type="button"
//         tooltip="Ether needs to be Wrapped and then deposited into the Exchange balance in order to be traded"
//         onClick={toggleModal}
//       >
//         + Wrap Ether
//       </TooltipWrapper>
//       <Modali.Modal {...modalHook} />
//     </>
//   )
// }

export default WrapUnwrapEtherBtn
