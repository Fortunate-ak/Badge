

export default function FormLayout({
    className = "",
    title = "",
    onSubmit = (e: React.FormEvent<Element>) => { },
    children
}: {
    className?: string,
    title?: string,
    onSubmit: (e: React.FormEvent<Element>) => void,
    children: React.ReactNode
}) {
    return <form className={"flex flex-col items-center gap-2 " + className} onSubmit={onSubmit}>
        <h1 className="text-2xl text-center font-semibold my-4">{title}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 text-left lg:w-2/3 md:w-3/4 w-full gap-6">
            
            {children}

            <button className="tw-button w-full md:col-span-2 col-span-1 cursor-pointer">Save</button>
        </div>
        
    </form>
}


export function FormElement({
    title = "",
    help_text = "",
    className = "",
    children
}: {
    title?: string,
    help_text?: string,
    className?: string,
    children: React.ReactNode
}) {
    return <div className={"flex flex-col " + className}>
        <label className="tw-label">{title}</label>
        {
            children
        }
        <p className="text-xs text-muted">{help_text}</p>
    </div>
}