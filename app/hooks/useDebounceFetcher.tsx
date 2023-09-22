import type { SubmitOptions } from "@remix-run/react"
import { useFetcher } from "@remix-run/react"
import { useEffect, useRef } from "react"

type SubmitTarget =
  | HTMLFormElement
  | HTMLButtonElement
  | HTMLInputElement
  | FormData
  | URLSearchParams
  | {
      [name: string]: string
    }
  | null

type DebounceSubmitFunction = (
  target: SubmitTarget,
  argOptions?: SubmitOptions & { debounceTimeout?: number },
) => void

type Required<Type, Key extends keyof Type> = Type & {
  [Property in Key]-?: Type[Property];
};

export function useDebounceFetcher<T>() {
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // no initialize step required since timeoutRef defaults undefined
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [timeoutRef])

  const fetcher = useFetcher<T>() as ReturnType<typeof useFetcher<T>> & {
    debounceSubmit?: DebounceSubmitFunction
  }

  fetcher.debounceSubmit = (target, argOptions) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    const { debounceTimeout = 0, ...options } = argOptions || {}

    if (debounceTimeout && debounceTimeout > 0) {
      timeoutRef.current = setTimeout(() => {
        fetcher.submit(target, options)
      }, debounceTimeout)
    } else {
      fetcher.submit(target, options)
    }
  }

  return fetcher as Required<typeof fetcher, "debounceSubmit">
}

/*
import {useDebounceFetcher} from '~/hooks/useDebounceFetcher';

const fetcher = useDebounceFetcher()
// works just like normal
fetcher.submit(form, {})
// this is the new addition
fetcher.debounceSubmit(form, {
    // the rest of the fetcher options still work
    // this is the only new option here
    debounceTimeout: 1000,
})

const fetcher = useDebounceFetcher()
// works just like normal
fetcher.submit(form, {})
// this is the new addition
fetcher.debounceSubmit(form, {
  // the rest of the fetcher options still work
  // this is the only new option here
  debounceTimeout: 1000,
})

*/

/*
function useDebounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  const timeoutRef = React.useRef<NodeJS.Timeout>()

  return React.useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        fn(...args)
      }, delay)
    },
    [fn, delay],
  )
}

const debouncedFormSubmit = useDebounce(fetcher.submit, 50)

<fetcher.Form
    method="post"
    onBlur={(e) =>
        debouncedFormSubmit(e.currentTarget, { replace: true })
    }
    onChange={(e) => {
        debouncedFormSubmit(e.currentTarget, { replace: true })
    }}                
    > 
</fetcher.Form>           
*/