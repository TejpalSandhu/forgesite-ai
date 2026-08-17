import { Request, Response } from 'express'
import prisma from '../lib/prisma.js';
import openai from '../configs/openai.js';

// Controller Function to Make Revision
export const makeRevision = async (req: Request, res: Response) => {
    const userId = req.userId;

    try {

        const { projectId } = req.params;
        const { message } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!userId || !user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (user.credits < 5) {
            return res.status(403).json({ message: 'add more credits to make changes' });
        }

        if (!message || message.trim() === '') {
            return res.status(400).json({ message: 'Please enter a valid prompt' });
        }

        const currentProject = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId },
            include: { versions: true }
        })

        if (!currentProject) {
            return res.status(404).json({ message: 'Project not found' });
        }

        await prisma.conversation.create({
            data: {
                role: 'user',
                content: message,
                projectId
            }
        })

        await prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: 5 } }
        })

        // Enhance user prompt
        const promptEnhanceResponse = await openai.chat.completions.create({
            model: 'z-ai/glm-5.2:free',
            messages: [
                {
                    role: 'system',
                    content: `
                    You are an expert web developer. 

                    CRITICAL REQUIREMENTS:
                    - Return ONLY the complete updated HTML code with the requested changes.
                    - Use Tailwind CSS for ALL styling (NO custom CSS).
                    - Use Tailwind utility classes for all styling changes.
                    - Include all JavaScript in <script> tags before closing </body>
                    - Make sure it's a complete, standalone HTML document with Tailwind CSS
                    - Return the HTML Code Only, nothing else

                    CRITICAL HARD RULES:
                    1. You MUST put ALL output ONLY into message.content.
                    2. You MUST NOT place anything in "reasoning", "analysis", "reasoning_details", or any hidden fields.
                    3. You MUST NOT include internal thoughts, explanations, analysis, comments, or markdown.
                    4. Do NOT include markdown, explanations, notes, or code fences.
                    5. Do NOT reference ANY external JavaScript library (Chart.js, jQuery, GSAP, etc.) unless you include its exact <script> CDN tag in <head>. If unsure, do not use it at all.
                    6. Do NOT reference images from any domain other than https://placehold.co — no other external image URLs are allowed, under any circumstances.
                    7. All inline <script> code MUST be syntactically valid. Do not use any undefined variables or functions.
                    8. Do NOT use tailwind.config = {...} as a <script> object — Tailwind v4's CDN build does not support it and will silently ignore it. Do NOT define custom colors, keyframes, or animations this way. Use only Tailwind's built-in default utility classes and animations (animate-pulse, animate-ping, animate-bounce, animate-spin), or write plain custom CSS with real @keyframes directly inside the <style> tag if a custom animation is needed. Never gate content visibility behind opacity:0 + scroll-triggered reveal classes unless the reveal script is guaranteed to run — prefer content visible by default.

                    Apply the requested changes while maintaining the Tailwind CSS styling approach.`
                },
                {
                    role: 'user',
                    content: `User's request: "${message}"`
                }
            ]
        })

        const enhancedPrompt = promptEnhanceResponse.choices[0].message.content;

        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: `I've enhanced your prompt to: "${enhancedPrompt}"`,
                projectId
            }
        })
        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: 'Now making changes to your website...',
                projectId
            }
        })

        // Generate website code
        const codeGenerationResponse = await openai.chat.completions.create({
            model: 'z-ai/glm-5.2:free',
            messages: [
                {
                    role: 'system',
                    content: `
                    You are an expert web developer. 

                    CRITICAL REQUIREMENTS:
                    - Return ONLY the complete updated HTML code with the requested changes.
                    - Use Tailwind CSS for ALL styling (NO custom CSS).
                    - Use Tailwind utility classes for all styling changes.
                    - Include all JavaScript in <script> tags before closing </body>
                    - Make sure it's a complete, standalone HTML document with Tailwind CSS
                    - Return the HTML Code Only, nothing else

                    Apply the requested changes while maintaining the Tailwind CSS styling approach.`
                },
                {
                    role: 'user',
                    content: `
                    Here is the current website code: "${currentProject.current_code}" The user wants this change: "${enhancedPrompt}"`
                }
            ]
        })

        const code = codeGenerationResponse.choices[0].message.content || '';

        if (!code) {
            await prisma.conversation.create({
                data: {
                    role: 'assistant',
                    content: "Unable to generate the code, please try again",
                    projectId
                }
            })
            await prisma.user.update({
                where: { id: userId },
                data: { credits: { increment: 5 } }
            })
            return;
        }

        const version = await prisma.version.create({
            data: {
                code: code.replace(/```[a-z]*\n?/gi, '')
                    .replace(/```$/g, '')
                    .trim(),
                description: 'changes made',
                projectId
            }
        })

        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: "I've made the changes to your website! You can now preview it",
                projectId
            }
        })

        await prisma.websiteProject.update({
            where: { id: projectId },
            data: {
                current_code: code.replace(/```[a-z]*\n?/gi, '')
                    .replace(/```$/g, '')
                    .trim(),
                current_version_index: version.id
            }
        })


        res.json({ message: 'Changes made successfully' })
    } catch (error: any) {
        await prisma.user.update({
            where: { id: userId },
            data: { credits: { increment: 5 } }
        })
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
}

// Controller Function to rollback to a specific version
export const rollbackToVersion = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { projectId, versionId } = req.params;

        const project = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId },
            include: { versions: true }
        })

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const version = project.versions.find((version) => version.id === versionId);

        if (!version) {
            return res.status(404).json({ message: 'Version not found' });
        }

        await prisma.websiteProject.update({
            where: { id: projectId, userId },
            data: {
                current_code: version.code,
                current_version_index: version.id
            }
        })

        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: "I've rolled back your website to selected version. You can now preview it",
                projectId
            }
        })

        res.json({ message: 'Version rolled back' });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
}

// Controller Function to Delete a Project
export const deleteProject = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { projectId } = req.params;

        await prisma.websiteProject.delete({
            where: { id: projectId, userId },
        })

        res.json({ message: 'Project deleted successfully' });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
}

// Controller for getting project code for preview
export const getProjectPreview = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { projectId } = req.params;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const project = await prisma.websiteProject.findFirst({
            where: { id: projectId, userId },
            include: { versions: true }
        })

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json({ project });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
}

// Get published projects
export const getPublishedProjects = async (req: Request, res: Response) => {
    try {

        const projects = await prisma.websiteProject.findMany({
            where: { isPublished: true },
            include: { user: true }
        })

        res.json({ projects });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
}

// Get a single project by id
export const getProjectById = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;

        const project = await prisma.websiteProject.findFirst({
            where: { id: projectId },
        })

        if (!project || project.isPublished === false || !project?.current_code) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json({ code: project.current_code });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
}

// Controller to save project code
export const saveProjectCode = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { projectId } = req.params;
        const { code } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!code) {
            return res.status(400).json({ message: 'Code is required' });
        }

        const project = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId }
        })

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        await prisma.websiteProject.update({
            where: { id: projectId },
            data: { current_code: code, current_version_index: '' }
        })

        res.json({ message: 'Project saved successfully' });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
}