/**
 * Utility to manage dynamic meta tags for social sharing (OG tags)
 */
export const metaService = {
    setMeta({
        title,
        description,
        image,
        url = window.location.href,
        type = 'website'
    }: {
        title?: string;
        description?: string;
        image?: string;
        url?: string;
        type?: string;
    }) {
        if (title) {
            document.title = title;
            this.setTag('property', 'og:title', title);
            this.setTag('name', 'twitter:title', title);
        }

        if (description) {
            this.setTag('name', 'description', description);
            this.setTag('property', 'og:description', description);
            this.setTag('name', 'twitter:description', description);
        }

        if (image) {
            // Ensure image URL is absolute for social bots
            const absoluteImage = image.startsWith('http') 
                ? image 
                : `${window.location.origin}${image.startsWith('/') ? '' : '/'}${image}`;
            
            this.setTag('property', 'og:image', absoluteImage);
            this.setTag('name', 'twitter:image', absoluteImage);
        }

        if (url) {
            this.setTag('property', 'og:url', url);
        }

        if (type) {
            this.setTag('property', 'og:type', type);
        }
    },

    setTag(attrName: string, attrValue: string, content: string) {
        let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute(attrName, attrValue);
            document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    },

    resetToDefault() {
        this.setMeta({
            title: 'Ai Vocab',
            description: 'Master English vocabulary with AI-powered coaching',
            image: '/og_image.png'
        });
    }
};
