

export default function OpportunityCard({ title, description, tags, company, logo, timestamp }: { title: string, description: string, tags: string[], company: string, logo?: string, timestamp?: string }) {
    return <div className="rounded-lg p-4 flex flex-col bg-primary/10 cursor-pointer transition-all **:transition-all group hover:bg-primary/90 hover:text-white">
        <div className="flex flex-row items-center">
            {logo && <img src={logo} className="size-8 rounded-md mr-2 bg-primary/10 p-1" />}
            <span className="text-sm text-muted font-semibold">{company}</span>
        </div>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="line-clamp-3 text-sm">
            {description}
        </p>
        <hr className="my-2 opacity-50" />
        <div className="flex flex-row flex-wrap gap-2">
        {
            tags.map(tag => <span key={tag} className="tw-tag">{tag}</span>)
        }
        </div>
        

    </div>
}