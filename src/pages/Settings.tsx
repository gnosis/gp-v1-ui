import React, { useState } from 'react'
import { useForm, FormContextValues, ValidationResolver, ErrorMessage, FieldErrors } from 'react-hook-form'
import { DevTool } from '@hookform/devtools'
import styled from 'styled-components'
import { MEDIA } from 'const'

import Joi from '@hapi/joi'
import { walletApi } from 'api'
import { setCustomWCOptions, getWCOptionsFromStorage } from 'utils'

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
})
  .oxor('infuraId', 'rpc')
  .messages({ 'object.oxor': 'InfuraId and RPC are mutually exclusive' })

interface WCSettingsProps {
  register: FormContextValues['register']
  errors: FieldErrors<SettingsFormData>
}

const OuterFormSection = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 1.5em;

  > div {
    margin: 0.5em;
  }
`

const AlternativesSection = styled.div`
  display: grid;
  outline: dotted;
  grid-template-columns: 1fr auto 1fr;

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

const ErrorWrapper = styled.p`
  color: var(--color-error);
  margin: 0;
  padding: 0.5em;
  font-size: 0.7em;
`

const InnerFormSection = styled.div`
  padding: 0.5em;
  background-color: aquamarine;
  position: relative;
  padding-bottom: 1em;

  ${ErrorWrapper} {
    position: absolute;
    bottom: 0;
  }
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
            </FormField>
            <WCError errors={errors} name="infuraId" />
          </InnerFormSection>
          <OrSeparator>
            <span>OR</span>
          </OrSeparator>
          <InnerFormSection>
            <FormField>
              <span>RPC URL</span>
              <input type="text" name="walletconnect.rpc" ref={register} placeholder="https://mainnet.path_to_node" />
            </FormField>
            <WCError errors={errors} name="rpc" />
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

interface WCSettingsData {
  infuraId?: string

  rpc?: string

  bridge?: string
}

interface SettingsFormData {
  walletconnect: WCSettingsData
}

// validates only walletconnect slice of form data
const WCresolver = (
  data: WCSettingsData,
): {
  values: WCSettingsData | null
  errors: FieldErrors<WCSettingsData> | null
  name: 'walletconnect'
} => {
  const result = WCSettingsSchema.validate(data, {
    abortEarly: false,
  })

  const { value: values, error } = result
  console.log('WCresolver::result', result)

  return {
    name: 'walletconnect',
    values: error ? null : values,
    errors: error
      ? error.details.reduce((previous, currentError) => {
          if (currentError.path.length === 0 && currentError.type === 'object.oxor') {
            return {
              ...previous,
              infuraId: currentError,
              rpc: currentError,
            }
          }
          return {
            ...previous,
            [currentError.path[0]]: currentError,
          }
        }, {})
      : null,
  }
}

const composeValuesErrors = <T extends SettingsFormData, K extends keyof T>(
  ...obj: { errors: null | FieldErrors<T[K]>; values: null | T[K]; name: K }[]
): {
  values: T | null
  errors: FieldErrors<T> | null
} => {
  const { errors, values } = obj.reduce<{
    errors: null | FieldErrors<T>
    values: null | T
  }>(
    (acc, elem) => {
      // accumulate errors
      // or leave as null
      if (elem.errors) {
        if (!acc.errors) acc.errors = {}

        acc.errors = {
          ...acc.errors,
          [elem.name]: elem.errors,
        }
      }

      // accumulate values
      // or make null if there are errors
      if (acc.errors) {
        acc.values = null
        return acc
      }

      if (!elem.values) return acc

      if (!acc.values) acc.values = {} as T
      acc.values = {
        ...acc.values,
        [elem.name]: elem.values,
      }

      return acc
    },
    { errors: null, values: null },
  )

  return {
    values: errors ? null : values,
    errors,
  }
}

const resolver: ValidationResolver<SettingsFormData> = data => {
  const { walletconnect } = data
  console.log('walletconnect', walletconnect)

  const result = WCresolver(walletconnect)
  const { values: walletconnectValues, errors: walletconnectErrors } = result
  console.log('result', result)
  console.log('walletconnectValues', walletconnectValues)
  console.log('walletconnectErrors', walletconnectErrors)

  // potentially allow for Setting sections other than WalletConnect
  const { values, errors } = composeValuesErrors(result)

  // const values: SettingsFormData | {} = walletconnectErrors
  //   ? {}
  //   : walletconnectValues
  //   ? {
  //       walletconnect: walletconnectValues,
  //     }
  //   : {}

  // const errors = walletconnectErrors
  //   ? {
  //       walletconnect: walletconnectErrors,
  //     }
  //   : {}

  console.log('FINAL::values', values)
  console.log('FINAL::errors', errors)

  return {
    values: errors ? {} : values || {},
    errors: errors || {},
  }
}

const SettingsWrapper = styled.div`
  width: 100%;
`

const getDefaultSettings = (): SettingsFormData => ({
  walletconnect: getWCOptionsFromStorage() as WCSettingsData,
})

export const Settings: React.FC = () => {
  // to not touch localStorage on every render
  const [defaultValues] = useState(getDefaultSettings)

  const { register, handleSubmit, errors, control, getValues } = useForm<SettingsFormData>({
    validationResolver: resolver,
    defaultValues,
  })
  console.log('errors', errors)
  console.log('getValues', getValues({ nest: true }))

  const onSubmit = async (data: SettingsFormData): Promise<void> => {
    console.log('WC_FORM::data', data)

    if (data.walletconnect) {
      if (!setCustomWCOptions(data.walletconnect)) return

      const reconnected = await walletApi.reconnectWC()
      console.log('reconnected', reconnected)
    }
  }

  return (
    <SettingsWrapper>
      <form onSubmit={handleSubmit(onSubmit)}>
        <WCSettings register={register} errors={errors} />
        <div>
          <SettingsButton type="submit">Apply Settings</SettingsButton>
        </div>
      </form>
      <DevTool control={control} />
    </SettingsWrapper>
  )
}
