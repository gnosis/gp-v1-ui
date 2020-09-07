import React from 'react'
import Joi from 'joi'
import { UseFormMethods } from 'react-hook-form'
import { FieldErrors } from 'react-hook-form/dist/types/form'
import { ErrorMessage } from '@hookform/error-message'
import styled from 'styled-components'

import { SettingsFormData, CustomResolverResult } from 'pages/Settings'
import { InputBox } from 'components/InputBox'
import { Input } from 'components/Input'

import { MEDIA } from 'const'
import { WCOptions } from 'utils'

const URLSchema = Joi.string()
  .empty('')
  .optional()
  .uri({ scheme: ['http', 'https'] })
const BridgeSchema = URLSchema.message('Bridge must be a valid URL')
const RPCSchema = URLSchema.message('RPC must be a valid URL')
const InfuraIdSchema = Joi.string().empty('').optional().length(32).message('Must be a valid id')

const WCSettingsSchema = Joi.object({
  bridge: BridgeSchema,
  infuraId: InfuraIdSchema,
  rpc: Joi.object({
    mainnet: RPCSchema,
    rinkeby: RPCSchema,
  }).empty({
    mainnet: '',
    rinkeby: '',
  }),
})
  .oxor('infuraId', 'rpc')
  .messages({ 'object.oxor': 'InfuraId and RPC are mutually exclusive' })
// bridge is optional
// infuraId and rpc are optional and exclusive

/* {
  values: WCOptions | null
  errors: DeepMap<SettingsFormData, FieldError> | (EmptyObject & DeepMap<SettingsFormData, FieldError>)
  name: 'walletconnect'
} */

// validates only walletconnect slice of form data
export const wcResolver = (data: WCOptions): CustomResolverResult<SettingsFormData> => {
  const result = WCSettingsSchema.validate(data, {
    abortEarly: false,
  })

  const { value: values, error } = result

  return {
    name: 'walletconnect',
    values: error ? null : values,
    errors: error
      ? error.details.reduce((previous, currentError) => {
          // when exlusive fields are both present
          if (currentError.path.length === 0 && currentError.type === 'object.oxor') {
            return {
              ...previous,
              infuraId: currentError,
              rpc: currentError,
            }
          }
          // any other error
          return {
            ...previous,
            [currentError.path[0]]: currentError,
          }
        }, {})
      : {},
  }
}

interface WCSettingsProps {
  register: UseFormMethods['register']
  errors: FieldErrors<SettingsFormData>
}

const OuterFormSection = styled.div`
  display: flex;
  flex-direction: column;

  > div {
    margin: 0.5em 0;
  }
`

const AlternativesSection = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;

  @media ${MEDIA.mobile} {
    grid-template-columns: 100%;
  }
`

const OrSeparator = styled.div`
  padding: 1.5em;
  font-size: 0.8em;
  display: flex;
  justify-content: center;
  align-items: center;

  @media ${MEDIA.mobile} {
    padding: 1rem 1.5em;
  }
}
`

const ErrorWrapper = styled.p`
  color: var(--color-error);
  margin: 0;
  padding: 0.5em;
  font-size: 0.7em;
`

const InnerFormSection = styled.div`
  padding: 0.7em;
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius);
  position: relative;

  ${ErrorWrapper} {
    position: absolute;
    bottom: 0;
  }
`

const FormField = styled.label`
  display: flex;
  flex-direction: column;
`

const Disclaimer = styled.div`
  display: flex;
  justify-content: center;

  > p {
    font-size: 1.3rem;
    width: 100%;
    border-radius: var(--border-radius);
  }
`

export const InputContainer = styled.div`
  small.inputLabel {
    position: absolute;
    left: 4%;
    top: 35%;
    font-size: 1.2rem;

    transition-property: top, left, font-size;
    transition-duration: 0.2s;
    transition-timing-function: ease-in-out;
  }

  ${InputBox} {
    margin: 0.7rem 0;

    > input {
      padding: 0 1rem;
      transition-property: top, left, font-size, opacity, padding;
      transition-duration: 0.2s;
      transition-timing-function: ease-in-out;

      &.movingLabel {
        padding: 0 1rem 0 8.2rem;

        &:focus {
          padding: 1rem 1rem 0 1rem;
        }

        &:focus ~ small.inputLabel {
          top: 0.5rem;
          left: 1.7%;
          font-size: 0.8rem;
        }
      }

      ::placeholder {
        opacity: 0.2;
      }
    }
  }
`

export const WCSettings: React.FC<WCSettingsProps> = ({ register, errors }) => {
  return (
    <div>
      <h1>WalletConnect Settings</h1>
      <Disclaimer>
        <p>
          Here you can set the <strong>InfuraId</strong> or <strong>RPC URL</strong> that will be used for connecting
          the WalletConnect provider to Mainnet and/or Rinkeby. It is also possible to set a custom WalletConnect{' '}
          <strong>Bridge URL</strong> to use instead of the default one.
        </p>
      </Disclaimer>
      <OuterFormSection>
        <h2>Infura/RPC Settings</h2>
        <AlternativesSection>
          <InnerFormSection>
            <FormField>
              <span>InfuraId</span>
              <InputContainer>
                <InputBox>
                  <Input type="text" name="walletconnect.infuraId" ref={register} />
                </InputBox>
              </InputContainer>
            </FormField>
            <WCError errors={errors} name="infuraId" />
          </InnerFormSection>
          <OrSeparator>
            <span>OR</span>
          </OrSeparator>
          <InnerFormSection>
            <FormField>
              <span>RPC URLs</span>
              <InputContainer>
                <InputBox>
                  <Input
                    type="text"
                    className="movingLabel"
                    name="walletconnect.rpc.mainnet"
                    ref={register}
                    placeholder="https://mainnet.node_url"
                  />
                  <small className="inputLabel">MAINNET </small>
                </InputBox>
              </InputContainer>
              <InputContainer>
                <InputBox>
                  <Input
                    type="text"
                    className="movingLabel"
                    name="walletconnect.rpc.rinkeby"
                    ref={register}
                    placeholder="https://rinkeby.node_url"
                  />
                  <small className="inputLabel">RINKEBY </small>
                </InputBox>
              </InputContainer>
            </FormField>
            <WCError errors={errors} name="rpc" />
          </InnerFormSection>
        </AlternativesSection>
        <h2>Bridge Settings</h2>
        <InnerFormSection>
          <FormField>
            <span>Bridge URL</span>
            <InputContainer>
              <InputBox>
                <Input
                  type="text"
                  name="walletconnect.bridge"
                  ref={register}
                  placeholder="https://bridge.walletconnect.org"
                />
              </InputBox>
            </InputContainer>
          </FormField>
          <WCError errors={errors} name="bridge" />
        </InnerFormSection>
      </OuterFormSection>
    </div>
  )
}

interface WCErrorsProps {
  errors: FieldErrors<SettingsFormData>
  name: string
}

const WCError: React.FC<WCErrorsProps> = ({ errors, name }) => {
  return (
    <ErrorWrapper>
      <ErrorMessage errors={errors} name={'walletconnect.' + name} />
    </ErrorWrapper>
  )
}
