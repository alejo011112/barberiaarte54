document.addEventListener("DOMContentLoaded", () => {
    
    /* ==========================================================================
       Custom Cursor Logic
       ========================================================================== */
    const cursor = document.querySelector('.cursor');
    const links = document.querySelectorAll('a, .btn, .gallery-item, .service-card');

    if (window.innerWidth > 768) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
    }

    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            cursor.classList.add('hovering');
        });
        link.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovering');
        });
    });

    /* Intersection observer no longer needed — GSAP ScrollTrigger handles scroll animations */

    /* ==========================================================================
       Parallax Effect for Hero Section
       ========================================================================== */
    const heroBg = document.querySelector('.hero-bg');
    
    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;
        if (scrollPosition < window.innerHeight) {
            // Apply parallax only when hero is visible
            heroBg.style.transform = `translateY(${scrollPosition * 0.4}px)`;
        }
    });

    /* ==========================================================================
       Particle System (Canvas)
       ========================================================================== */
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    
    let particlesArray = [];
    let trailParticles = [];
    let burstParticles = [];
    
    let mouse = {
        x: null,
        y: null,
        radius: 80
    };

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
        
        // Add trail particle
        trailParticles.push(new TrailParticle(mouse.x, mouse.y));
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('click', (event) => {
        // Emit 12 burst particles
        for(let i=0; i<12; i++) {
            burstParticles.push(new BurstParticle(event.clientX, event.clientY));
        }
    });

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.baseX = this.x;
            this.baseY = this.y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
            this.density = (Math.random() * 30) + 1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
            // Drift logic
            this.baseX += this.directionX;
            this.baseY += this.directionY;

            if (this.baseX > canvas.width || this.baseX < 0) {
                this.directionX = -this.directionX;
            }
            if (this.baseY > canvas.height || this.baseY < 0) {
                this.directionY = -this.directionY;
            }

            // Repulsion logic
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (mouse.x !== null && distance < mouse.radius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (mouse.radius - distance) / mouse.radius;
                const directionX = forceDirectionX * force * this.density;
                const directionY = forceDirectionY * force * this.density;
                
                this.x -= directionX;
                this.y -= directionY;
            } else {
                // Return to base position lerp
                if (this.x !== this.baseX) {
                    let dx = this.baseX - this.x;
                    this.x += dx * 0.05;
                }
                if (this.y !== this.baseY) {
                    let dy = this.baseY - this.y;
                    this.y += dy * 0.05;
                }
            }
            
            this.draw();
        }
    }
    
    class TrailParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 2 + 1;
            this.opacity = 0.5;
            this.life = 400; // ms
            this.birth = Date.now();
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.fill();
        }
        update() {
            let age = Date.now() - this.birth;
            this.opacity = Math.max(0, 0.5 - (age / this.life) * 0.5);
            this.draw();
            return age < this.life;
        }
    }
    
    class BurstParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            this.velocityX = Math.cos(angle) * speed;
            this.velocityY = Math.sin(angle) * speed;
            this.size = Math.random() * 2 + 1.5;
            this.opacity = 1;
            this.life = 600; // ms
            this.birth = Date.now();
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.fill();
        }
        update() {
            this.x += this.velocityX;
            this.y += this.velocityY;
            let age = Date.now() - this.birth;
            this.opacity = Math.max(0, 1 - (age / this.life));
            this.draw();
            return age < this.life;
        }
    }

    function initParticles() {
        particlesArray = [];
        let numberOfParticles = (canvas.height * canvas.width) / 15000;
        
        if(numberOfParticles > 100) numberOfParticles = 100;

        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 0.5;
            let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * 0.4) - 0.2;
            let directionY = (Math.random() * 0.4) - 0.2;
            let color = 'rgba(255, 255, 255, 0.4)';

            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    function animateParticles() {
        requestAnimationFrame(animateParticles);
        ctx.clearRect(0, 0, innerWidth, innerHeight);

        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        
        trailParticles = trailParticles.filter(p => p.update());
        burstParticles = burstParticles.filter(p => p.update());
    }

    initParticles();
    animateParticles();

    // Resize event
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    });
});

/* ==========================================================================
   GSAP Animations
   ========================================================================== */
gsap.registerPlugin(ScrollTrigger);

// Navbar reveal
gsap.fromTo('.navbar',
  { opacity: 0, y: -30 },
  { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.1 }
);

// Hero — staggered entrance
gsap.fromTo('.hero-title',
  { opacity: 0, y: 120 },
  { opacity: 1, y: 0, duration: 1.2, ease: 'power4.out', delay: 0.3 }
);
gsap.fromTo('.hero-subtitle',
  { opacity: 0, y: 80 },
  { opacity: 1, y: 0, duration: 1.1, ease: 'power4.out', delay: 0.55 }
);
gsap.fromTo('.hero-buttons',
  { opacity: 0, y: 60 },
  { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.75 }
);
gsap.fromTo('.social-proof',
  { opacity: 0, y: 40 },
  { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.95 }
);
gsap.fromTo('.scroll-indicator',
  { opacity: 0 },
  { opacity: 1, duration: 1, ease: 'power2.out', delay: 1.3 }
);

// Section titles (fade-in-scroll)
gsap.utils.toArray('.section-title.fade-in-scroll').forEach(el => {
  gsap.fromTo(el,
    { opacity: 0, y: 50 },
    { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 80%' }
    }
  );
});

// Servicios — service cards
gsap.fromTo('.service-card',
  { opacity: 0, y: 80 },
  { opacity: 1, y: 0, duration: 0.8, stagger: 0.18, ease: 'power3.out',
    scrollTrigger: { trigger: '#servicios', start: 'top 70%' }
  }
);

// Galería — gallery images
gsap.fromTo('.gallery-item img',
  { opacity: 0, scale: 0.85 },
  { opacity: 1, scale: 1, duration: 0.7, stagger: 0.1, ease: 'power2.out',
    scrollTrigger: { trigger: '#galeria', start: 'top 70%' }
  }
);

// Galería — gallery item containers
gsap.fromTo('.gallery-item',
  { opacity: 0, y: 40 },
  { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out',
    scrollTrigger: { trigger: '#galeria', start: 'top 70%' }
  }
);

// Testimonios — stats bar
gsap.fromTo('.stats-bar',
  { opacity: 0, y: 40 },
  { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '#testimonios', start: 'top 75%' }
  }
);

// Testimonios — carousel
gsap.fromTo('.carousel-container',
  { opacity: 0, y: 40 },
  { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '#testimonios', start: 'top 65%' }
  }
);

// Reservas section label + title
gsap.fromTo('.reservas-label',
  { opacity: 0, y: 30 },
  { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '#reservar', start: 'top 75%' }
  }
);
gsap.fromTo('#reservar .section-title',
  { opacity: 0, y: 50 },
  { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.15,
    scrollTrigger: { trigger: '#reservar', start: 'top 75%' }
  }
);
gsap.fromTo('.reservas-grid',
  { opacity: 0, y: 60 },
  { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.3,
    scrollTrigger: { trigger: '#reservar', start: 'top 70%' }
  }
);

// Footer
gsap.fromTo('.footer .container',
  { opacity: 0, y: 50 },
  { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '#contacto', start: 'top 80%' }
  }
);

