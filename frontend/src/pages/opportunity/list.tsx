import OpportunityCard from "../../ui/opportunity-card"


let sampleOpportunities = [
    {
        title: "Frontend Developer",
        description: "We are looking for a frontend developer to join our team.",
        tags: ["React", "TypeScript", "CSS"],
        company: "Tech Corp",
        logo: "https://www.svgrepo.com/show/353822/google-pay-icon.svg",
    },
    {
        title: "Backend Developer",
        description: "We are looking for a backend developer to join our team.",
        tags: ["Node.js", "Express", "MongoDB"],
        company: "Dev Solutions",
        logo: "https://www.svgrepo.com/show/353822/google-pay-icon.svg",
    },
    {
        title: "Full Stack Developer",
        description: "We are looking for a full stack developer to join our team.",
        tags: ["React", "Node.js", "GraphQL"],
        company: "Innovatech",
        logo: "https://www.svgrepo.com/show/353822/google-pay-icon.svg",
    },
    {
        title: "Data Scientist",
        description: "We are looking for a data scientist to join our team.",
        tags: ["Python", "Machine Learning", "Data Analysis"],
        company: "Data Insights",
        logo: "https://www.svgrepo.com/show/353822/google-pay-icon.svg",
    }
]

export default function Opportunities() {
    return <div>
        <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
            {sampleOpportunities.map((opportunity, index) => <OpportunityCard key={index} {...opportunity} />)}
        </div>
    </div>
}