import { useNavigate } from "react-router"


export default function OpportunityCard({ id, title, description, tags, company, logo, timestamp }: { id: string, title: string, description: string, tags: string[], company: string, logo?: string, timestamp?: string }) {
    const navigate = useNavigate();
    return <div onClick={() => navigate(`/opportunities/${id}`)} className="rounded-lg p-4 flex flex-col bg-primary/10 cursor-pointer transition-all **:transition-all hover:bg-primary/20">
        <div className="flex flex-row items-center">
            {logo && <img src={logo} className="size-8 rounded-full mr-2 bg-primary/10 p-1" />}
            <span className="text-sm text-muted font-bold">{company}</span>
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