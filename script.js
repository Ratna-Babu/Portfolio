import { profile } from './constants/profile.js';
import { skills } from './constants/skills.js';
import { featuredPosts } from './constants/featured.js';
import { projects } from './constants/projects.js';
import { experience } from './constants/experience.js';
import { certificates } from './constants/certificates.js';

document.addEventListener("DOMContentLoaded", function() {
    gsap.registerPlugin(ScrollTrigger);

    // --- RENDER FUNCTIONS ---
    function renderProfile() {
        // Render hero section
        document.querySelector('.hero-title').innerHTML = `
            <span class="line">Hello, I'm <br><span class="accent-text">${profile.name}</span></span>
        `;
        document.querySelector('.hero-description').textContent = "An aspiring engineering student passionate about building impactful digital solutions.";
        
        const contactBtn = document.querySelector('.hero-buttons .btn-primary');
        contactBtn.textContent = "Contact Me";
        contactBtn.href = "#contact";
        
        const resumeBtn = document.querySelector('.hero-buttons .btn-secondary');
        resumeBtn.textContent = "Resume";
        resumeBtn.href = "constants/resume/Resume.pdf";
        resumeBtn.setAttribute('download', 'Ratna_Babu_Resume.pdf');
        
        document.querySelector('.hero-image').src = profile.profilePicture;
        document.querySelector('.logo').textContent = `${profile.name}.`;

        // Render about section
        const aboutContent = document.querySelector('.about-content');
        aboutContent.innerHTML = `
            <div class="about-grid">
                <div class="about-text-wrapper">
                    ${profile.about.map(p => `<p class="about-text">${p}</p>`).join('')}
                </div>
                <div class="about-values">
                    ${profile.values.map(value => `
                        <div class="value-card">
                            <i class="${value.icon}"></i>
                            <div class="value-card-text">
                                <h3>${value.title}</h3>
                                <p>${value.description}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Render contact section
        document.querySelector('.contact-text').textContent = "I'm currently open to new opportunities and collaborations. Whether you have a question or just want to say hi, my inbox is always open. Feel free to reach out!";
        document.querySelector('.contact-email').textContent = profile.email;
        document.querySelector('.contact-email').href = `mailto:${profile.email}`;
        const socialLinks = document.querySelector('.social-links');
        socialLinks.innerHTML = '';
        profile.social.forEach(link => {
            const a = document.createElement('a');
            a.href = link.url;
            a.textContent = link.name;
            socialLinks.appendChild(a);
        });
        document.querySelector('.footer p').innerHTML = `&copy; ${new Date().getFullYear()} ${profile.name}. All Rights Reserved.`;
    }

    function renderSkills() {
        const filtersContainer = document.querySelector('.skills-filters');
        const gridContainer = document.querySelector('.skills-grid');
        filtersContainer.innerHTML = '';
        gridContainer.innerHTML = '';

        skills.filters.forEach((filter, index) => {
            const button = document.createElement('button');
            button.className = `filter-btn ${index === 0 ? 'active' : ''}`;
            button.dataset.filter = filter.filter;
            button.textContent = filter.name;
            filtersContainer.appendChild(button);
        });

        skills.skillset.forEach(skill => {
            const item = document.createElement('div');
            item.className = 'skill-item';
            if (!skill.icon) {
                item.classList.add('no-icon');
            }
            item.dataset.category = skill.category;
            
            if (skill.icon) {
                const i = document.createElement('i');
                i.className = skill.icon;
                item.appendChild(i);
            }
            
            const span = document.createElement('span');
            span.textContent = skill.name;
            item.appendChild(span);
            
            gridContainer.appendChild(item);
        });
    }

    function renderFeaturedSlider() {
        const slidesContainer = document.querySelector('.featured-slides-container');
        const paginationContainer = document.querySelector('#featured-pagination');
        if (!slidesContainer || !paginationContainer) return;

        slidesContainer.innerHTML = '';
        paginationContainer.innerHTML = '';

        featuredPosts.forEach((post, index) => {
            const slide = document.createElement('div');
            slide.className = 'featured-slide';
            slide.dataset.index = index;

            let imageGridHTML = '';
            // Conditionally generate the image grid based on the number of images
            if (post.images.length === 1) {
                imageGridHTML = `
                    <div class="featured-image-grid single-image">
                        <img src="${post.images[0]}" alt="${post.name} preview">
                    </div>
                `;
            } else { // Default to the 3-image layout
                imageGridHTML = `
                    <div class="featured-image-grid">
                        <img src="${post.images[0]}" alt="${post.name} preview 1">
                        <img src="${post.images[1]}" alt="${post.name} preview 2">
                        <img src="${post.images[2]}" alt="${post.name} preview 3">
                    </div>
                `;
            }

            const descriptionHTML = `
                <div class="featured-description">
                    <h3>${post.name}</h3>
                    <p>${post.description}</p>
                    <div class="featured-tags">
                        ${post.tags.map(tag => `<span>${tag}</span>`).join('')}
                    </div>
                    <a href="${post.caseStudyUrl}" class="btn btn-secondary">${post.buttonText} →</a>
                </div>
            `;

            slide.innerHTML = imageGridHTML + descriptionHTML;
            slidesContainer.appendChild(slide);

            const dot = document.createElement('div');
            dot.className = 'pagination-dot';
            dot.dataset.index = index;
            paginationContainer.appendChild(dot);
        });

        setupCardSlider();
    }

    function setupCardSlider() {
        const wrapper = document.querySelector('.featured-slider-wrapper');
        const slidesContainer = document.querySelector('.featured-slides-container');
        let slides = document.querySelectorAll('.featured-slide');
        const dots = document.querySelectorAll('.pagination-dot');
        const nextBtn = document.querySelector('#featured-next');
        const prevBtn = document.querySelector('#featured-prev');
        
        if (!wrapper || slides.length <= 1) {
            if (nextBtn) nextBtn.style.display = 'none';
            if (prevBtn) prevBtn.style.display = 'none';
            if (slides.length === 1) slides[0].classList.add('active');
            return;
        }

        // --- Infinite Loop Setup ---
        const firstClone = slides[0].cloneNode(true);
        const lastClone = slides[slides.length - 1].cloneNode(true);
        slidesContainer.appendChild(firstClone);
        slidesContainer.insertBefore(lastClone, slides[0]);
        
        slides = document.querySelectorAll('.featured-slide');
        let currentIndex = 1;
        let isAnimating = false;
        let autoplayInterval;

        const getSlideDimensions = () => ({
            slideWidth: slides[1].offsetWidth,
            slideMargin: parseFloat(window.getComputedStyle(slides[1]).marginRight) * 2
        });

        const setSliderPosition = (index) => {
            const { slideWidth, slideMargin } = getSlideDimensions();
            const offset = (wrapper.offsetWidth - slideWidth) / 2;
            const targetX = offset - index * (slideWidth + slideMargin);
            gsap.set(slidesContainer, { x: targetX });
        };

        const updateActiveState = () => {
            const realIndex = (currentIndex - 1 + (slides.length - 2)) % (slides.length - 2);
            slides.forEach((slide, i) => slide.classList.toggle('active', i === currentIndex));
            dots.forEach((dot, i) => dot.classList.toggle('active', i === realIndex));
        };

        const goToSlide = (index) => {
            if (isAnimating) return;
            isAnimating = true;
            currentIndex = index;

            const { slideWidth, slideMargin } = getSlideDimensions();
            const offset = (wrapper.offsetWidth - slideWidth) / 2;
            const targetX = offset - currentIndex * (slideWidth + slideMargin);
            
            updateActiveState();

            gsap.to(slidesContainer, {
                x: targetX,
                duration: 0.7,
                ease: 'power3.inOut',
                onComplete: () => {
                    let jumped = false;
                    if (currentIndex === 0) {
                        currentIndex = slides.length - 2;
                        setSliderPosition(currentIndex);
                        jumped = true;
                    } else if (currentIndex === slides.length - 1) {
                        currentIndex = 1;
                        setSliderPosition(currentIndex);
                        jumped = true;
                    }

                    // If a jump occurred, re-sync the active state immediately
                    // to prevent the "dark" card flash.
                    if (jumped) {
                        updateActiveState();
                    }

                    isAnimating = false;
                }
            });
        };
        
        const resetAutoplay = () => {
            clearInterval(autoplayInterval);
            autoplayInterval = setInterval(() => goToSlide(currentIndex + 1), 5000);
        };

        nextBtn.addEventListener('click', () => {
            goToSlide(currentIndex + 1);
            resetAutoplay();
        });
        prevBtn.addEventListener('click', () => {
            goToSlide(currentIndex - 1);
            resetAutoplay();
        });
        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                goToSlide(i + 1);
                resetAutoplay();
            });
        });

        wrapper.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
        wrapper.addEventListener('mouseleave', resetAutoplay);

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => setSliderPosition(currentIndex), 250);
        });

        setSliderPosition(currentIndex);
        updateActiveState();
        resetAutoplay();
    }

    function renderOtherProjects() {
        const grid = document.querySelector('.projects-grid');
        if (!grid) return;
        grid.innerHTML = '';

        projects.other.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <div class="project-image-container">
                    <img src="${project.image}" alt="${project.name}" class="project-image">
                </div>
                <div class="project-info">
                    <div class="project-header">
                        <h3 class="project-title">${project.name}</h3>
                        <div class="project-links">
                            <a href="${project.sourceCodeUrl}" target="_blank" rel="noopener noreferrer" aria-label="${project.name} Source Code">
                                <i class="devicon-github-original"></i>
                            </a>
                        </div>
                    </div>
                    <p class="project-description">${project.description}</p>
                    <div class="project-tech-stack">
                        ${project.techStack.map(tech => `<span>${tech}</span>`).join('')}
                    </div>
                </div>
            `;
            grid.appendChild(card);

            // Add click listener to the project image
            const projectImage = card.querySelector('.project-image');
            projectImage.addEventListener('click', () => {
                openImageModal(project.image, project.name);
            });
        });

        setupProjectDisplay();
    }

    function setupProjectDisplay() {
        const grid = document.querySelector('.projects-grid');
        const showMoreBtn = document.querySelector('#show-more-projects');
        const showLessBtn = document.querySelector('#show-less-projects');
        const initialCount = 6; // 2 rows of 3
        const allProjects = Array.from(grid.children);

        if (allProjects.length <= initialCount) {
            showMoreBtn.style.display = 'none';
            return;
        }

        // Initially hide the extra projects
        allProjects.forEach((project, index) => {
            if (index >= initialCount) {
                project.style.display = 'none';
            }
        });
        showLessBtn.style.display = 'none';

        showMoreBtn.addEventListener('click', () => {
            allProjects.forEach((project, index) => {
                if (index >= initialCount) {
                    project.style.display = 'flex'; // Use flex because the card is a flex container
                }
            });
            // Animate them in
            gsap.from(allProjects.slice(initialCount), {
                opacity: 0,
                y: 30,
                stagger: 0.1,
                duration: 0.5,
                onComplete: () => ScrollTrigger.refresh()
            });
            showMoreBtn.style.display = 'none';
            showLessBtn.style.display = 'block';
        });

        showLessBtn.addEventListener('click', () => {
            const extraProjects = allProjects.slice(initialCount);
            gsap.to(extraProjects, {
                opacity: 0,
                y: 30,
                stagger: 0.1,
                duration: 0.5,
                onComplete: () => {
                    extraProjects.forEach(project => {
                        project.style.display = 'none';
                    });
                    showMoreBtn.style.display = 'block';
                    showLessBtn.style.display = 'none';
                    ScrollTrigger.refresh();
                }
            });
        });
    }

    function renderExperience() {
        const timeline = document.querySelector('.timeline');
        timeline.innerHTML = '';
        experience.forEach(item => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            timelineItem.innerHTML = `
                <div class="timeline-dot"></div>
                <div class="timeline-date">${item.date}</div>
                <div class="timeline-content">
                    <h3>${item.title}</h3>
                    <h4 class="timeline-company">${item.company}</h4>
                    <ul>
                        ${item.description.map(point => `<li>${point}</li>`).join('')}
                    </ul>
                </div>
            `;
            timeline.appendChild(timelineItem);
        });
    }

    function renderCertificates() {
        const gallery = document.querySelector('.certificates-gallery');
        const showMoreBtn = document.querySelector('#show-more-certs');
        const showLessBtn = document.querySelector('#show-less-certs');
        const initialCount = 6;
        let isExpanded = false;

        function updateGallery() {
            gallery.innerHTML = '';
            const certsToShow = isExpanded ? certificates : certificates.slice(0, initialCount);

            certsToShow.forEach(cert => {
                const certItem = document.createElement('div');
                certItem.className = 'cert-item';
                certItem.innerHTML = `<img src="${cert.thumbnail}" alt="${cert.name}">`;
                
                certItem.addEventListener('click', () => {
                    openImageModal(cert.path, cert.name);
                });

                gallery.appendChild(certItem);
            });

            // Add tilt effect to newly created items
            const certItems = gallery.querySelectorAll('.cert-item');
            certItems.forEach(item => {
                item.addEventListener('mousemove', (e) => {
                    const rect = item.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;

                    const rotateY = (x / rect.width) * 30; // Max rotation 15deg
                    const rotateX = -(y / rect.height) * 30; // Max rotation 15deg

                    item.style.transform = `translateY(-10px) scale(1.05) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                    item.style.transition = 'transform 0.1s linear';
                });

                item.addEventListener('mouseleave', () => {
                    item.style.transform = 'translateY(0) scale(1) rotateX(0) rotateY(0)';
                    item.style.transition = 'transform 0.4s ease';
                });
            });


            gsap.fromTo(certItems, 
                { opacity: 0, scale: 0.8 },
                { 
                    opacity: 1, 
                    scale: 1, 
                    duration: 0.5, 
                    stagger: 0.1,
                    ease: 'power3.out'
                }
            );

            if (certificates.length <= initialCount) {
                showMoreBtn.style.display = 'none';
                showLessBtn.style.display = 'none';
            } else if (isExpanded) {
                showMoreBtn.style.display = 'none';
                showLessBtn.style.display = 'block';
            } else {
                showMoreBtn.style.display = 'block';
                showLessBtn.style.display = 'none';
            }
        }

        showMoreBtn.addEventListener('click', () => {
            isExpanded = true;
            updateGallery();
            setTimeout(() => ScrollTrigger.refresh(), 500);
        });

        showLessBtn.addEventListener('click', () => {
            isExpanded = false;
            
            // Scroll to the top of the section so the user sees the collapse animation
            document.querySelector('#certificates').scrollIntoView({ behavior: 'smooth', block: 'start' });

            const certsToHide = Array.from(gallery.children).slice(initialCount);

            // A small delay to allow scrolling to start before animating
            setTimeout(() => {
                // Use a faster, reversed stagger animation for a better "collapse" effect
            gsap.to(certsToHide, {
                opacity: 0,
                scale: 0.8,
                    duration: 0.3,    // Faster animation
                    stagger: {
                        each: 0.05,   // Faster stagger
                        from: "end"   // Animate from the last item backwards
                    },
                    ease: 'power2.in',
                onComplete: () => {
                    updateGallery();
                        // Refresh ScrollTrigger after DOM is updated
                    setTimeout(() => ScrollTrigger.refresh(), 100);
                }
            });
            }, 300); // Delay to ensure scroll has started
        });

        updateGallery();
    }
    
    // Modal logic for featured images
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('imageModalImg');
    const modalClose = document.getElementById('imageModalClose');

    function openImageModal(src, alt) {
        if (!modal) return;
        modalImg.src = src;
        modalImg.alt = alt || 'Preview';
        modal.classList.add('active');
        document.body.classList.add('modal-open');
    }
    function closeImageModal() {
        if (!modal) return;
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        // Clear image after animation frame to avoid flicker
        requestAnimationFrame(() => { modalImg.src = ''; });
    }

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeImageModal();
    });
    modalClose?.addEventListener('click', closeImageModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.classList.contains('active')) closeImageModal();
    });
    
    // --- INITIALIZE CONTENT ---
    renderProfile();
    renderSkills();
    renderFeaturedSlider();
    renderOtherProjects();
    renderExperience();
    renderCertificates();

    // --- PARTICLE BACKGROUND ---
    if (typeof tsParticles !== 'undefined') {
        tsParticles.load("particles-js", {
            fpsLimit: 60,
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: "#ffffff"
                },
                shape: {
                    type: "circle"
                },
                opacity: {
                    value: 0.5,
                    random: false,
                    anim: {
                        enable: false,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: false,
                        speed: 40,
                        size_min: 0.1,
                        sync: false
                    }
                },
                links: {
                    enable: true,
                    distance: 150,
                    color: "#00A3FF",
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: false,
                    straight: false,
                    out_mode: "out",
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: {
                        enable: true,
                        mode: "repulse"
                    },
                    onclick: {
                        enable: true,
                        mode: "push"
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 400,
                        line_linked: {
                            opacity: 1
                        }
                    },
                    bubble: {
                        distance: 400,
                        size: 40,
                        duration: 2,
                        opacity: 0.8,
                        speed: 3
                    },
                    repulse: {
                        distance: 150
                    },
                    push: {
                        particles_nb: 4
                    },
                    remove: {
                        particles_nb: 2
                    }
                }
            },
            retina_detect: true
        });
    }

    // --- CUSTOM CURSOR SNAKE TRAIL ---
    const trailPath = document.getElementById('cursor-trail-path');
    const cursorHeadDot = document.querySelector('.cursor-head-dot');
    const totalPoints = 15;
    const points = [];
    let mouseX = 0, mouseY = 0;

    for (let i = 0; i < totalPoints; i++) {
        points.push({ x: 0, y: 0, alpha: 1 });
    }

    window.addEventListener("mousemove", e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    gsap.ticker.add(() => {
        const speed = 0.4;
        // Update leader point
        const leader = points[0];
        leader.x += (mouseX - leader.x) * speed;
        leader.y += (mouseY - leader.y) * speed;

        // Update follower points
        for (let i = 1; i < totalPoints; i++) {
            const point = points[i];
            const follow = points[i - 1];
            point.x += (follow.x - point.x) * speed;
            point.y += (follow.y - point.y) * speed;
        }

        // Update head dot position
        if (cursorHeadDot) {
            gsap.set(cursorHeadDot, { x: leader.x, y: leader.y });
        }

        // Generate and set the tapered path
        if (trailPath) {
            const pathData = [];
            const pathWidth = 4;

            for (let i = 0; i < totalPoints - 1; i++) {
                const p1 = points[i];
                const p2 = points[i + 1];

                const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                const perpAngle = angle + Math.PI / 2;

                const width = pathWidth * ((totalPoints - i) / totalPoints);

                const p1_left = {
                    x: p1.x + Math.cos(perpAngle) * width,
                    y: p1.y + Math.sin(perpAngle) * width
                };
                const p1_right = {
                    x: p1.x - Math.cos(perpAngle) * width,
                    y: p1.y - Math.sin(perpAngle) * width
                };

                pathData.push({ p1_left, p1_right });
            }
            
            let d = `M ${pathData[0].p1_left.x} ${pathData[0].p1_left.y}`;
            for (let i = 0; i < pathData.length; i++) {
                d += ` L ${pathData[i].p1_left.x} ${pathData[i].p1_left.y}`;
            }
            for (let i = pathData.length - 1; i >= 0; i--) {
                d += ` L ${pathData[i].p1_right.x} ${pathData[i].p1_right.y}`;
            }
            d += " Z";
            trailPath.setAttribute('d', d);
        }
    });

    // --- ABOUT ME ANIMATION ---
    const aboutGrid = document.querySelector('.about-grid');
    if (aboutGrid) {
        gsap.from('.about-text-wrapper > *', {
            scrollTrigger: {
                trigger: '.about-text-wrapper',
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: 'power3.out',
        });
        gsap.from('.value-card', {
            scrollTrigger: {
                trigger: '.about-values',
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out',
        });
    }

    // --- HEADER SCROLL ---
    const header = document.querySelector('.header');
    ScrollTrigger.create({
        start: 'top top',
        end: 99999,
        onUpdate: (self) => {
            if (self.direction === 1 && self.progress > 0) { // Scrolling down
                header.classList.add('scrolled');
            } else if (self.direction === -1 && self.scroll() < 50) { // Scrolling up to top
                header.classList.remove('scrolled');
            }
        }
    });

    // --- ACTIVE NAV LINK ON SCROLL ---
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: "top center",
            end: "bottom center",
            onToggle: self => {
                if (self.isActive) {
                    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
                    const id = section.getAttribute('id');
                    const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            }
        });
    });

    // --- HERO SECTION ANIMATION ---
    const heroTimeline = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.5 } });
    heroTimeline
        .from('.hero-title .line', { y: '100%', stagger: 0.2, delay: 0.2 })
        .from('.hero-description', { opacity: 0, y: 20 }, '-=0.8')
        .from('.hero-buttons', { opacity: 0, y: 20 }, '-=0.8')
        .from('.hero-image-wrapper', { opacity: 0, scale: 0.8 }, '-=1');

    // --- GENERIC SCROLL-TRIGGERED ANIMATIONS ---
    const animateUpElements = document.querySelectorAll('.section-title, .featured-description > *, .project-card, .certificates-gallery img, .contact > *');
    animateUpElements.forEach(el => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
            y: 50,
            opacity: 0,
            duration: 1,
        });
    });

    gsap.from('.featured-image-grid img', {
        scrollTrigger: {
            trigger: '.featured-image-grid',
            start: 'top 80%',
            toggleActions: 'play none none none',
        },
        scale: 0.8,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8
    });

    // --- SKILLS FILTER ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const skillItems = document.querySelectorAll('.skill-item');
    gsap.set(skillItems, { transformOrigin: "center center" });

    function filterSkills(filterValue) {
            const tl = gsap.timeline();
            tl.to(skillItems, {
                scale: 0,
                opacity: 0,
                duration: 0.3,
                stagger: 0.05,
                ease: 'power2.in',
                onComplete: () => {
                    skillItems.forEach(item => {
                        const itemCategory = item.dataset.category;
                        if (filterValue === 'all' || filterValue === itemCategory) {
                        item.style.display = 'flex';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                    gsap.to(skillItems, {
                        scale: 1,
                        opacity: 1,
                        duration: 0.3,
                        stagger: 0.05,
                    ease: 'power2.out',
                    onComplete: ScrollTrigger.refresh
                    });
                }
            });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filterValue = btn.dataset.filter;
            filterSkills(filterValue);
        });
    });

    // Initial filter on page load
    const initialFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'language';
    filterSkills(initialFilter);
    
    gsap.from('.skill-item', {
        scrollTrigger: {
            trigger: '.skills-grid',
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.8
    });

    // --- EXPERIENCE TIMELINE ANIMATION ---
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
        gsap.from(item.querySelector('.timeline-content'), {
            scrollTrigger: {
                trigger: item,
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
            opacity: 0,
            scale: 0.8,
            x: item.matches(':nth-child(odd)') ? -50 : 50,
            duration: 0.8
        });
    });
});