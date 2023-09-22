import useHydrated from "~/hooks/useHydrated"

export function ProgressiveClientOnly({
    children,
    className = "",
}: {
    children: React.ReactNode | (() => React.ReactNode)
    className: string
}) {
    const isHydrated = useHydrated()
    return (
        <div
        className={
            // Create this class in your tailwind config
            isHydrated ? className : "animate-appear"
        }
        >
        {typeof children === "function" ? children() : children}
        </div>
    )
}


/*
<ProgressiveClientOnly className="animate-fade">
    <label className="flex flex-col">
        Progressive with JS
        <input type="text" defaultValue={localStorageValue} />
    </label>
</ProgressiveClientOnly>
*/