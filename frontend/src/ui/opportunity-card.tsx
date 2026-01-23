import { useNavigate } from "react-router"
import { timeLeft } from "../utils";


export default function OpportunityCard({ id, title, description, tags, company, logo, expiry_date }: { id: string, title: string, description: string, tags: string[], company: string, logo?: string, expiry_date?: string }) {
    const navigate = useNavigate();
    return <div onClick={() => navigate(`/opportunities/${id}`)} className="p-4 border border-border rounded-md bg-secondary flex flex-col cursor-pointer transition-all **:transition-all">
        <div className="flex flex-row items-center">
            {logo && <img src={logo} className="size-8 rounded-full mr-2 bg-primary/10 p-1" />}
            <div className="flex flex-col *:m-0">
                <span className="text-sm text-muted font-bold">{company}</span>
                <span className="text-[0.7rem] text-muted">{timeLeft(expiry_date || "")}</span>
            </div>
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