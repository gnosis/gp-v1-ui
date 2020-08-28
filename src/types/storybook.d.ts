import { Story } from '@storybook/react/types-6-0'
declare module '@storybook/addons' {
  export interface BaseStory<Args, StoryFnReturnType> {
    bind(thisArg: Parameters<Function['bind']>[0]): Story<Args>
    bind(...args: Parameters<Function['bind']>): ReturnType<Function['bind']>
  }
}
