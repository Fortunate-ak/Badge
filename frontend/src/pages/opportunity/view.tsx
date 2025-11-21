import { useState } from "react";
import type { Opportunity } from "../../types";
import { timeAgo } from "../../utils";



export default function OpportunityViewPage() {

    const [value, setValue] = useState<Opportunity|any>({
        id: "",
        company: "Tech Corp",
        title: "Senior Frontend Developer",
        description: "We are looking for a senior frontend developer to join our team. The ideal candidate will have experience with React, TypeScript, and CSS. You will be responsible for building and maintaining our web applications.",
        updated_at: "2024-06-01",
    });
    
    return <div className="grid grid-cols-[1fr_3fr] gap-4 items-start">
        <div className="flex flex-col p-4 pt-0">
            <img src="https://www.svgrepo.com/show/353822/google-pay-icon.svg" alt="company logo" className="w-full p-2 border border-border rounded-full" />
            <h2 className="text-2xl font-bold mt-2">{value.company}</h2>
            <h3 className="text-sm">Education</h3>
            <p className="text-foreground/70 text-sm my-2">Tech Corp is a leading technology company specializing in innovative solutions for businesses worldwide. We are committed to excellence and fostering a collaborative work environment.</p>


            <ul className="flex flex-col gap-1 *:flex *:flex-row *:gap-1 *:items-center *:text-sm">
                <li>
                    <span className="mso text-xl text-muted">location_on</span>
                    Harare / Zimbabwe
                </li>
                <li>
                    <span className="mso text-xl text-muted">mail</span>
                    info@techcorp.com
                </li>
                <li>
                    <span className="mso text-xl text-muted">link</span>
                    techcorp.com
                </li>
                <li>
                    <span className="mso text-xl text-muted">phone</span>
                    +123-456-7890
                </li>
            </ul>
        </div>

        <div className="rounded-xl border border-border p-4 flex flex-col">
            <div className="flex flex-row justify-between items-center mb-1">
                <span className="text-sm text-foreground/50">Posted {timeAgo(value.updated_at)}</span>
                <ActionButton />
                
            </div>
            <div className="mb-2">
                <h1 className="text-3xl font-bold mb-2">{value.title}</h1>
                <p className="mb-2">{value.description}</p>

                <div className="flex flex-row gap-2 mb-2">
                    {
                        ["React", "TypeScript", "CSS"].map((tag, index) => <span key={index} className="tw-tag">{tag}</span>)
                    }
                </div>
            </div>
            <hr />

            <article className="flex flex-col gap-2 mt-4">
                <h1 className="text-xl font-bold">Job Description</h1>
                <p>
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Doloribus ut sit eius quis cupiditate nihil, amet nisi nobis corrupti non dolores dolorum rerum id ex saepe deleniti! Qui, aliquam iure?
                </p>

                <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus, ratione dolore blanditiis doloribus quam veniam mollitia soluta aspernatur, repudiandae tenetur illum sed totam reprehenderit dolorem provident cum sunt ducimus velit.
                </p>

                <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Est neque ducimus suscipit officia. Iste fuga quis vitae est sunt distinctio! Non debitis minima labore esse ad suscipit repudiandae doloremque reprehenderit.
                </p>
            </article>
        </div>
    </div>
}

/**
 * This function returns the appropriate action button based on user. 
 * If the user is a viewer, it returns an "Apply Now" button. If the user has applied, it returns a see application status button.
 * If the user has editing rights, it returns an "edit" span.
 * @returns the correct action button
 */
function ActionButton() {

    if (true) {
        return <button className="tw-button">Apply Now</button>
    }
    return <span className="mso">edit</span>
}