gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Draw dial ticks
(function drawTicks(){
  const g = document.querySelector('.dial-ticks');
  if(!g) return;
  for(let i=0;i<12;i++){
    const a = (i/12) * Math.PI * 2;
    const r1 = i % 3 === 0 ? 125 : 138;
    const x1 = 200 + Math.cos(a) * r1;
    const y1 = 200 + Math.sin(a) * r1;
    const x2 = 200 + Math.cos(a) * 148;
    const y2 = 200 + Math.sin(a) * 148;
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1',x1); line.setAttribute('y1',y1);
    line.setAttribute('x2',x2); line.setAttribute('y2',y2);
    line.setAttribute('stroke', i % 3 === 0 ? '#B9924C' : '#38352A');
    line.setAttribute('stroke-width', i % 3 === 0 ? 2.5 : 1.5);
    g.appendChild(line);
  }
})();

if(reduceMotion){
  document.querySelectorAll('.stage').forEach(s => s.classList.add('is-active'));
} else {

  // Hero entrance: one orchestrated sequence, not scattered fades
  gsap.set('.dial-stage', {opacity:0, scale:.85});
  gsap.set('.hero-copy > *', {opacity:0, y:16});
  gsap.set('.scroll-cue', {opacity:0});

  const introTl = gsap.timeline({defaults:{ease:'power3.out'}});
  introTl
    .to('.hero-copy > *', {opacity:1, y:0, duration:.7, stagger:.12})
    .to('.dial-stage', {opacity:1, scale:1, duration:.8}, '-=.4')
    .from('.hand-hour', {rotate:-140, duration:1.1, ease:'power2.out'}, '-=.5')
    .from('.hand-min', {rotate:220, duration:1.1, ease:'power2.out'}, '<')
    .to('.scroll-cue', {opacity:1, duration:.5}, '-=.3');

  // Continuous second-hand sweep
  gsap.to('.hand-sec', {rotate:360, duration:6, repeat:-1, ease:'none', transformOrigin:'200px 200px'});

  // Pinned scroll-scrubbed assembly: gears rotate and stages light up in sequence
  const stages = gsap.utils.toArray('.stage');

  const scrubTl = gsap.timeline({
    scrollTrigger:{
      trigger:'.movement',
      start:'top top',
      end:'+=150%',
      scrub:.6,
      pin:'.movement-pin',
      anticipatePin:1
    }
  });

  scrubTl
    .to('.gear-a', {rotate:60, transformOrigin:'200px 200px', duration:1}, 0)
    .to('.gear-b', {rotate:-90, transformOrigin:'290px 150px', duration:1}, 0)
    .to('.gear-c', {rotate:120, transformOrigin:'120px 260px', duration:1}, 0);

  // Stage activation tied directly to the pinned scrub progress
  ScrollTrigger.create({
    trigger:'.movement',
    start:'top top',
    end:'+=150%',
    onUpdate: self => {
      const idx = Math.min(stages.length - 1, Math.floor(self.progress * stages.length));
      stages.forEach((s, i) => s.classList.toggle('is-active', i <= idx));
    }
  });
}

// Smooth-scroll fallback for the reserve link on older browsers
document.querySelector('.bar-cta')?.addEventListener('click', e => {
  const target = document.querySelector('#reserve');
  if(target && 'scrollBehavior' in document.documentElement.style){
    // native smooth-scroll via CSS handles it
  } else if(target){
    e.preventDefault();
    target.scrollIntoView();
  }
});
