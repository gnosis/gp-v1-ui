import React from 'react'
import { useForm, FormContextValues, ValidationResolver, ErrorMessage, FieldErrors } from 'react-hook-form'
import { DevTool } from '@hookform/devtools'
import styled from 'styled-components'
import { MEDIA } from 'const'

import Joi from '@hapi/joi'

const BridgeSchema = Joi.string()
  .empty('')
  .optional()
  .uri({ scheme: ['http', 'https'] })
const RPCSchema = BridgeSchema
const InfuraIdSchema = Joi.string()
  .empty('')
  .optional()
  .length(32)

const WCSettingsSchema = Joi.object({
  bridge: BridgeSchema.message('Bridge must be a valid URL'),
  infuraId: InfuraIdSchema.message('Must be a valid id'),
  rpc: RPCSchema.message('RPC must be a valid URL'),
}).oxor('infuraId', 'rpc')
// const WCSettingsSchema = Joi.alternatives().try(
//   Joi.object({
//     bridge: BridgeSchema.message('Bridge must be a valid URL'),
//     infuraId: InfuraIdSchema,
//     rpc: '',
//   }),
//   Joi.object({
//     bridge: BridgeSchema.message('Bridge must be a valid URL'),
//     infuraId: '',
//     rpc: RPCSchema.message('RPC must be a valid URL'),
//   }),
//   Joi.object({
//     bridge: BridgeSchema.message('Bridge must be a valid URL'),
//     infuraId: '',
//     rpc: '',
//   }),
// )

interface WCSettingsProps {
  register: FormContextValues['register']
  errors: FieldErrors<SettingsFormData>
}

const OuterFormSection = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 1.5em;
  /* min-width: 80vw; */

  > div {
    margin: 0.5em;
  }
`

const AlternativesSection = styled.div`
  display: grid;
  outline: dotted;
  /* flex-wrap: wrap; */
  grid-template-columns: 1fr auto 1fr;
  /* grid-template-rows: 1fr auto 1fr; */
  /* grid-template-areas: 'field or field' 'field or field'; */

  @media ${MEDIA.mobile} {
    grid-template-rows: 1fr auto 1fr;
    grid-template-columns: auto;
  }
`

const OrSeparator = styled.div`
  padding: 0.5em;
  text-align: center;
  font-size: 0.8em;
`

const InnerFormSection = styled.div`
  padding: 0.5em;
  background-color: aquamarine;
  /* flex: 1 0 0; */
  /* grid-area: field; */
`

const FormField = styled.label`
  display: flex;
  flex-direction: column;

  > input {
    width: auto;
    /* min-width: 32ch; */
    font-size: 1em;
    font-weight: normal;

    ::placeholder {
      opacity: 0.2;
    }
  }
`

const Disclaimer = styled.div`
  display: flex;
  justify-content: center;

  > p {
    font-size: 1.4em;
    max-width: 400px;
    background-color: antiquewhite;
    width: 100%;
    padding: 0.5em;
    border-radius: 8px;
  }
`

const SettingsButton = styled.button`
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  background: #c2d1ff;
  font-size: 1.4rem;
  color: var(--color-text-active);
  -webkit-letter-spacing: 0;
  -moz-letter-spacing: 0;
  -ms-letter-spacing: 0;
  letter-spacing: 0;
  line-height: 1;
  margin: 0 1.6rem;
  border-radius: 0.6rem;
  outline: 0;
  height: 3.6rem;
  letter-spacing: 0.03rem;
`

export const WCSettings: React.FC<WCSettingsProps> = ({ register, errors }) => {
  return (
    <div>
      <Disclaimer>
        <p>
          Here you can set InfuraId or RPC URl that willbe used for connecting WalletConnect provider to mainnet. It is
          also possible to set WalletConnect bridge URL to use instead of the default one
        </p>
      </Disclaimer>
      <OuterFormSection>
        <AlternativesSection>
          <InnerFormSection>
            <FormField>
              <span>IfuraId</span>
              <input type="text" name="walletconnect.infuraId" ref={register} />
              <WCError errors={errors} name="infuraId" />
            </FormField>
          </InnerFormSection>
          <OrSeparator>
            <span>OR</span>
          </OrSeparator>
          <InnerFormSection>
            <FormField>
              <span>RPC URL</span>
              <input type="text" name="walletconnect.rpc" ref={register} placeholder="https://mainnet.path_to_node" />
              <WCError errors={errors} name="rpc" />
            </FormField>
          </InnerFormSection>
        </AlternativesSection>

        <InnerFormSection>
          <FormField>
            <span>Bridge URL</span>
            <input
              type="text"
              name="walletconnect.bridge"
              ref={register}
              placeholder="https://bridge.walletconnect.org"
            />
            <WCError errors={errors} name="bridge" />
          </FormField>
        </InnerFormSection>
      </OuterFormSection>
    </div>
  )
}

const ErrorWrapper = styled.p`
  color: var(--color-error);
  margin: 0;
  padding: 0.5em;
`

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

type WCSettingsData = (
  | {
      infuraId: string
    }
  | {
      rpc: string
    }
) & {
  bridge?: string
}

interface SettingsFormData {
  walletconnect: WCSettingsData
}

const resolver: ValidationResolver<SettingsFormData> = (data, validationContext) => {
  console.log('validationContext', validationContext)
  const { walletconnect } = data
  console.log('walletconnect', walletconnect)
  const result = WCSettingsSchema.validate(walletconnect, {
    abortEarly: false,
  })
  const { value: values, error } = result
  console.log('result', result)
  console.log('values', values)
  console.log('error', error)

  let errors = {}
  if (error) {
    errors = {
      walletconnect: error.details.reduce((previous, currentError) => {
        return {
          ...previous,
          [currentError.path[0]]: currentError,
        }
      }, {}),
    }
  }

  return {
    values: error ? {} : values,
    errors,
  }
}

interface ErrorMessageProps {
  error: string
}

// const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
//   return <p>{error}</p>
// }

export const Settings: React.FC = () => {
  const { register, handleSubmit, watch, errors, control, getValues } = useForm<SettingsFormData>({
    validationResolver: resolver,
  })
  console.log('errors', errors)
  console.log('getValues', getValues({ nest: true }))

  const onSubmit = (data: SettingsFormData): void => {
    console.log('WC_FORM::data', data)
  }

  return (
    <div style={{ width: '100%' }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <WCSettings register={register} errors={errors} />
        <div>
          <SettingsButton type="submit">Apply Settings</SettingsButton>
        </div>
      </form>
      <DevTool control={control} />
    </div>
  )
}
