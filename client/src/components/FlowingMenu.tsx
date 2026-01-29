import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

import './FlowingMenu.css';

function FlowingMenu({
  items = [],
  speed = 15,
  textColor = '#fff',
  bgColor = '#060010',
  marqueeBgColor = '#fff',
  marqueeTextColor = '#060010',
  borderColor = '#fff'
}) {
  return (
    <div className="menu-wrap" style={{ backgroundColor: bgColor }}>
      <nav className="menu">
        {items.map((item, idx) => (
          <MenuItem
            key={idx}
            {...item}
            speed={speed}
            textColor={textColor}
            marqueeBgColor={marqueeBgColor}
            marqueeTextColor={marqueeTextColor}
            borderColor={borderColor}
          />
        ))}
      </nav>
    </div>
  );
}

function MenuItem({ link, text, image, speed, textColor, marqueeBgColor, marqueeTextColor, borderColor }) {
  const itemRef = useRef(null);
  const marqueeRef = useRef(null);
  const marqueeInnerRef = useRef(null);
  const animationRef = useRef(null);
  const [repetitions, setRepetitions] = useState(4);

  const animationDefaults = { duration: 0.8, ease: 'power2.out' };

  const findClosestEdge = (mouseX, mouseY, width, height) => {
    const distanceToTop = mouseY;
    const distanceToBottom = height - mouseY;
    const distanceToLeft = mouseX;
    const distanceToRight = width - mouseX;
    
    const minDistance = Math.min(distanceToTop, distanceToBottom, distanceToLeft, distanceToRight);
    
    if (minDistance === distanceToTop) return 'top';
    if (minDistance === distanceToBottom) return 'bottom';
    if (minDistance === distanceToLeft) return 'left';
    return 'right';
  };

  const distMetric = (x, y, x2, y2) => {
    const xDiff = x - x2;
    const yDiff = y - y2;
    return xDiff * xDiff + yDiff * yDiff;
  };

  useEffect(() => {
    const calculateRepetitions = () => {
      if (!marqueeInnerRef.current) return;

      const marqueeContent = marqueeInnerRef.current.querySelector('.marquee__part');
      if (!marqueeContent) return;

      const contentWidth = marqueeContent.offsetWidth;
      const viewportWidth = window.innerWidth;

      const needed = Math.ceil(viewportWidth / contentWidth) + 2;
      setRepetitions(Math.max(4, needed));
    };

    calculateRepetitions();
    window.addEventListener('resize', calculateRepetitions);
    return () => window.removeEventListener('resize', calculateRepetitions);
  }, [text, image]);

  useEffect(() => {
    const setupMarquee = () => {
      if (!marqueeInnerRef.current) return;

      const marqueeContent = marqueeInnerRef.current.querySelector('.marquee__part');
      if (!marqueeContent) return;

      const contentWidth = marqueeContent.offsetWidth;
      if (contentWidth === 0) return;

      if (animationRef.current) {
        animationRef.current.kill();
      }

      animationRef.current = gsap.to(marqueeInnerRef.current, {
        x: -contentWidth,
        duration: speed,
        ease: 'none',
        repeat: -1
      });
    };

    const timer = setTimeout(setupMarquee, 50);

    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [text, image, repetitions, speed]);

  const handleMouseEnter = ev => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    let marqueeStartY, marqueeInnerStartY;
    
    if (edge === 'top') {
      marqueeStartY = '-101%';
      marqueeInnerStartY = '101%';
    } else if (edge === 'bottom') {
      marqueeStartY = '101%';
      marqueeInnerStartY = '-101%';
    } else if (edge === 'left') {
      marqueeStartY = '-101%';
      marqueeInnerStartY = '101%';
    } else { // right
      marqueeStartY = '101%';
      marqueeInnerStartY = '-101%';
    }

    gsap
      .timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: marqueeStartY }, 0)
      .set(marqueeInnerRef.current, { y: marqueeInnerStartY }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' }, 0);
  };

  const handleMouseLeave = ev => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    let marqueeEndY, marqueeInnerEndY;
    
    if (edge === 'top') {
      marqueeEndY = '-101%';
      marqueeInnerEndY = '101%';
    } else if (edge === 'bottom') {
      marqueeEndY = '101%';
      marqueeInnerEndY = '-101%';
    } else if (edge === 'left') {
      marqueeEndY = '-101%';
      marqueeInnerEndY = '101%';
    } else { // right
      marqueeEndY = '101%';
      marqueeInnerEndY = '-101%';
    }

    gsap
      .timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: marqueeEndY }, 0)
      .to(marqueeInnerRef.current, { y: marqueeInnerEndY }, 0);
  };

  return (
    <div className="menu__item" ref={itemRef} style={{ borderColor }}>
      <a
        className="menu__item-link"
        href={link}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ color: textColor }}
      >
        {text}
      </a>
      <div className="marquee" ref={marqueeRef} style={{ backgroundColor: marqueeBgColor }}>
        <div className="marquee__inner-wrap">
          <div className="marquee__inner" ref={marqueeInnerRef} aria-hidden="true">
            {[...Array(repetitions)].map((_, idx) => (
              <div className="marquee__part" key={idx} style={{ color: marqueeTextColor }}>
                <span>{text}</span>
                <div className="marquee__img" style={{ backgroundImage: `url(${image})` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlowingMenu;