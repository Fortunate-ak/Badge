import ConsentCard from "../../ui/consent-card";


let sampleContents = [
    {
        title: "Consent to Share Academic Records",
        tags: ["Academic", "Records"],
        company: "University of Example",
        logo: "https://www.svgrepo.com/show/353822/google-pay-icon.svg",
        timestamp: "2024-06-01T12:00:00Z"
    }
];

export default function Consent() {
    return <div className="grid grid-cols-4 gap-4">
        {
            sampleContents.map((content, index) => <ConsentCard key={index} {...content} />)
        }
    </div>
}