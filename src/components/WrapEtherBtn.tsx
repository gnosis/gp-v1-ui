import React from 'react'
import styled from 'styled-components'
// import { useNumberInput } from 'components/TradeWidget/useNumberInput'
import { DEFAULT_MODAL_OPTIONS, ModalBodyWrapper } from 'components/Modal'
import Modali, { useModali } from 'modali'
import { InputBox } from 'components/InputBox'
import { useForm } from 'react-hook-form'
import { DEFAULT_PRECISION, formatAmountFull } from '@gnosis.pm/dex-js'
import BN from 'bn.js'
import { validatePositiveConstructor, validInputPattern } from 'utils'
import { TooltipWrapper } from 'components/Tooltip'
import useSafeState from 'hooks/useSafeState'

export const INPUT_ID_WRAP_ETH_AMOUNT = 'etherAmount'

const ModalWrapper = styled(ModalBodyWrapper)`
  > div {
    margin: 3rem 1.5rem;

    ${InputBox} {
      position: relative;
      display: flex;
      flex-flow: row wrap;

      i {
        position: absolute;
        right: 1rem;
        top: 0;
        bottom: 0;
        margin: 0;
        color: #476481;
        letter-spacing: -0.05rem;
        text-align: right;
        font-family: var(--font-default);
        font-weight: var(--font-weight-bold);
        font-size: 1.2rem;
        font-style: normal;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }

  .error {
    color: red;
  }

  b {
    font-size: 1.3rem;
    color: #2f3e4e;
    margin: 0 1.6rem 0 0;
    margin-bottom: 0.5rem;
    padding-left: -0.5;
    display: block;
  }

  a {
    color: rgb(33, 141, 255);
  }

  p a {
    font-size: 1.2rem;
    margin-left: 0.2rem;
  }

  .more-info {
    font-size: 1.3rem;
    padding-left: 1rem;
  }
`

interface WrapUnwrapEtherBtnProps {
  wrap: boolean
  label?: string
  className?: string
}

export type WrapEtherBtnProps = Omit<WrapUnwrapEtherBtnProps, 'wrap'>

const WrapUnwrapEtherBtn: React.FC<WrapUnwrapEtherBtnProps> = (props: WrapUnwrapEtherBtnProps) => {
  const { wrap, label, className } = props
  const [wethHelpVisible, showWethHelp] = useSafeState(false)
  const { register, errors, setValue } = useForm()
  const wrapEtherError = errors[INPUT_ID_WRAP_ETH_AMOUNT]
  // const [isWrapEtherModalVisible, showWrapEtherModal] = useSafeState(false)

  // TODO: Get balance in another PR
  const availableBalanceInEther = new BN('1234567800000000000')

  const title = wrap ? 'Wrap Ether' : 'Unwrap Ether'
  const WethHelp = (
    <div className="more-info">
      <p>Gnosis Protocol allows to exchange any ERC20 token, but since ETH is not one, it needs to be wrapped first.</p>
      <p>
        Wrapping is sending your ether into the WETH contract. That would mint the same amount of WETH as ETH you send
        to it.
      </p>
      <p>You can exchange back ETH for WETH any time, this is called Unwrapping WETH.</p>
      <p>
        Learn more about WETH{' '}
        <a target="_blank" rel="noopener noreferrer" href="https://weth.io/">
          weth.io
        </a>
      </p>
    </div>
  )

  const description = wrap ? (
    <>
      <p>
        Wrap ETH into WETH, so it can later be deposited into the exchange.{' '}
        <a onClick={(): void => showWethHelp(!wethHelpVisible)}>
          {wethHelpVisible ? '[-] Show less...' : '[+] Show more...'}
        </a>
      </p>
      {wethHelpVisible && WethHelp}
    </>
  ) : (
    <>
      <p>
        Unwrap converts back WETH into ETH.{' '}
        {!wethHelpVisible && <a onClick={(): void => showWethHelp(true)}>Learn more...</a>}
      </p>
      {wethHelpVisible && WethHelp}
    </>
  )

  const [modalHook, toggleModal] = useModali({
    ...DEFAULT_MODAL_OPTIONS,
    title,
    message: (
      <ModalWrapper>
        <div>
          {description}
          <b>Available Ether</b>
          <div>
            <a
              onClick={(): void => setValue(INPUT_ID_WRAP_ETH_AMOUNT, formatAmountFull(availableBalanceInEther), true)}
            >
              {formatAmountFull({ amount: availableBalanceInEther, precision: DEFAULT_PRECISION }) || ''} ETH
            </a>
          </div>
        </div>
        <div>
          <b>Amount to Wrap</b>
          <div>
            <InputBox>
              <i>ETH</i>
              <input
                type="text"
                name={INPUT_ID_WRAP_ETH_AMOUNT}
                // value={wethAmountToWrap}
                // onChange={enforcePrecisionEtherAmount}
                // onChange={(e: ChangeEvent<HTMLInputElement>): void => setWethAmountToWrap(e.target.value)}
                placeholder="0"
                autoFocus
                required
                ref={register({
                  pattern: { value: validInputPattern, message: 'Invalid amount' },
                  validate: { positive: validatePositiveConstructor('Invalid amount') },
                  required: 'The amount is required',
                  min: 0,
                })}
                // onFocus={(e): void => e.target.select()}
                // onKeyPress={onKeyPressEtherAmount}
                // onBlur={removeExcessZerosEtherAmount}
              />
            </InputBox>
          </div>
          {wrapEtherError && <p className="error">Invalid amount</p>}
        </div>
      </ModalWrapper>
    ),
    buttons: [
      <Modali.Button label="Cancel" key="no" isStyleCancel onClick={(): void => toggleModal()} />,
      <Modali.Button label="Continue" key="yes" isStyleDefault onClick={(): void => toggleModal()} />,
    ],
  })

  const tooltipText = wrap ? (
    <div>
      Wrap converts ETH into WETH,
      <br />
      so it can be deposited into the exchange)
    </div>
  ) : (
    'Unwrap converts back WETH into ETH'
  )

  return (
    <>
      <TooltipWrapper as="button" type="button" className={className} onClick={toggleModal} tooltip={tooltipText}>
        {label || title}
      </TooltipWrapper>
      <Modali.Modal {...modalHook} />
    </>
  )
}

export const WrapEtherBtn: React.FC<WrapEtherBtnProps> = (props: WrapEtherBtnProps) => (
  <WrapUnwrapEtherBtn wrap={true} {...props} />
)

export const UnwrapEtherBtn: React.FC<WrapEtherBtnProps> = (props: WrapEtherBtnProps) => (
  <WrapUnwrapEtherBtn wrap={false} {...props} />
)
