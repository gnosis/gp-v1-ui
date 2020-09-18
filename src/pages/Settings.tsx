import React, { useMemo } from 'react'
import { useForm, Resolver as FormResolver, FieldErrors, ResolverResult } from 'react-hook-form'
import styled from 'styled-components'
import { DevTool } from 'HookFormDevtool'

import { walletApi } from 'api'
import { setCustomWCOptions, getWCOptionsFromStorage, WCOptions } from 'utils'
import { useHistory } from 'react-router'
import { WCSettings, wcResolver } from 'components/Settings/WalletConnect'
import { ContentPage } from 'components/layout'

const SettingsButtonSubmit = styled.button`
  height: 3.6rem;
  letter-spacing: 0.03rem;

  border-radius: 0.6rem;
  padding: 0 1.6rem;
  text-transform: uppercase;
  font-size: 1.4rem;
  line-height: 1;
`

const ButtonsContainer = styled.div`
  margin-top: 2em;
  display: flex;
  justify-content: space-between;
`

const SettingsButtonReset = styled(SettingsButtonSubmit)`
  background-color: transparent;
  color: var(--color-text-active);

  &:hover {
    color: var(--color-background-button-hover);
    background-color: transparent;
  }
`

const SettingsWrapper = styled(ContentPage)`
  padding: 1.5em;
  width: 90%;
  max-width: 110rem;

  > form {
    width: 100%;

    > div > h1 {
      margin: 0;
    }
  }
`

export interface SettingsFormData {
  walletconnect: WCOptions | {}
}

export type CustomResolverResult<T extends SettingsFormData, K extends keyof T = keyof T> = ResolverResult<T> & {
  name: K
}

export interface SliceResolver<T extends SettingsFormData, K extends keyof T = keyof T> {
  (data: T[K]): CustomResolverResult<T>
}

const composeValuesErrors = <T extends SettingsFormData, K extends keyof T>(
  resolvedResults: { errors: null | FieldErrors<T[K]>; values: null | T[K]; name: K }[],
): {
  values: T | null
  errors: FieldErrors<T> | null
} => {
  const { errors, values } = resolvedResults.reduce<{
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
      // or set to null if there are errors
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

const composeResolvers = (resolvers: { [K in keyof SettingsFormData]: SliceResolver<SettingsFormData, K> }) => {
  return (data: SettingsFormData): CustomResolverResult<SettingsFormData>[] => {
    return Object.keys(data).map((key: keyof SettingsFormData) => {
      const resolver = resolvers[key]
      return resolver(data[key])
    })
  }
}

const mainResolver = composeResolvers({
  walletconnect: wcResolver,
})

const resolver: FormResolver<SettingsFormData> = async (data) => {
  const results = mainResolver(data)

  // potentially allow for Setting sections other than WalletConnect
  const { values, errors } = composeValuesErrors(results)

  return {
    values: errors ? {} : values || {},
    errors: errors || {},
  }
}

const getDefaultSettings = (): SettingsFormData => ({
  walletconnect: getWCOptionsFromStorage(),
})

const Settings: React.FC = () => {
  // to not touch localStorage on every render
  // but at the same time pull in updated values from storage on mount
  const defaultValues = useMemo(getDefaultSettings, [])

  const { register, handleSubmit, errors, control } = useForm<SettingsFormData>({
    resolver,
    defaultValues,
  })

  const history = useHistory()

  const onSubmit = async (data: SettingsFormData): Promise<void> => {
    if (data.walletconnect) {
      // if options didn't change, exit early
      if (!setCustomWCOptions(data.walletconnect)) return

      // connect with new options
      // with Web3Modal prompt and everything
      const reconnected = await walletApi.reconnectWC()
      // if successful, redirect to home
      if (reconnected) history.push('/')
    }
  }

  return (
    <SettingsWrapper>
      <form onSubmit={handleSubmit(onSubmit)}>
        <WCSettings register={register} errors={errors} />
        <ButtonsContainer>
          <SettingsButtonReset type="reset">Reset</SettingsButtonReset>
          <SettingsButtonSubmit type="submit">Apply Settings</SettingsButtonSubmit>
        </ButtonsContainer>
      </form>
      {process.env.NODE_ENV === 'development' && <DevTool control={control} />}
    </SettingsWrapper>
  )
}

export default Settings
