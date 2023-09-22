import { useEffect } from 'react'
import { type ToastMessage } from '~/utils/toast/flash-session.server'
import { toast } from '~/components/core/ui/use-toast'

export const useToast = (message?: ToastMessage) => {
	useEffect(() => {
		if (message) {
			toast({
				variant: message.variant,
				title: message.title,
				description: message.description,
			})
		}
	}, [message])
}