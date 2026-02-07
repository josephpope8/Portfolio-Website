const now = new Date();
const hour = now.getHours();

let greeting = "";

if(hour < 12){
    greeting = "Good Morning! ";
} else if(hour < 18){
    greeting = "Good Afternoon! ";
} else {
    greeting = "Good Evening! ";
}

document.getElementById("greeting").textContent = greeting;

// Background mouse interaction: move accent radial when hovering
(function(){
    const root = document.documentElement;

    // Create and insert canvas for the network
    const canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // sizing helpers (support high-DPI)
    function resize() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(window.innerWidth * dpr);
        canvas.height = Math.round(window.innerHeight * dpr);
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener('resize', resize);
    resize();

    // particles (increased density for more lines, bounded for performance)
    const POINTS = Math.max(30, Math.min(130, Math.floor((window.innerWidth * window.innerHeight) / 60000)));
    const points = [];
    for(let i=0;i<POINTS;i++){
        points.push({
            x: Math.random()*window.innerWidth,
            y: Math.random()*window.innerHeight,
            vx: (Math.random()-0.5) * 0.4,
            vy: (Math.random()-0.5) * 0.4
        });
    }

    // long, faint connecting lines between random point pairs (geometric accent)
    const LONG_LINES = Math.max(4, Math.min(14, Math.floor(POINTS / 8)));
    const longLines = [];
    for(let i=0;i<LONG_LINES;i++){
        const a = Math.floor(Math.random()*POINTS);
        let b = Math.floor(Math.random()*POINTS);
        if(b===a) b = (a+1)%POINTS;
        longLines.push({a, b, phase: Math.random()*Math.PI*2, amp: 6 + Math.random()*18});
    }

    // no mouse-driven highlights to keep animation lightweight

    // simple lerp helper
    function lerp(a,b,t){ return a + (b-a)*t; }

    // animation loop
    let last = performance.now();
    function frame(now){
        const dt = Math.min(40, now - last);
        last = now;

        // clear
        ctx.clearRect(0,0,canvas.width,canvas.height);

        // update points
        for(let p of points){
            p.x += p.vx * (dt/16);
            p.y += p.vy * (dt/16);
            if(p.x < -20) p.x = window.innerWidth + 20;
            if(p.x > window.innerWidth + 20) p.x = -20;
            if(p.y < -20) p.y = window.innerHeight + 20;
            if(p.y > window.innerHeight + 20) p.y = -20;
        }

        // draw long faint geometric lines first
        for(const L of longLines){
            const A = points[L.a];
            const B = points[L.b];
            const ang = Math.atan2(B.y - A.y, B.x - A.x) + Math.PI/2;
            const offset = Math.sin(now/1200 + L.phase) * L.amp;
            const ox = Math.cos(ang) * offset;
            const oy = Math.sin(ang) * offset;
            ctx.strokeStyle = 'rgba(120,160,200,0.03)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(A.x + ox, A.y + oy);
            ctx.lineTo(B.x + ox, B.y + oy);
            ctx.stroke();
        }

        // draw point-to-point connections (limit checks for performance)
        const maxDist = 180;
        ctx.lineWidth = 1;
        for(let i=0;i<points.length;i++){
            const a = points[i];
            // small dot
            ctx.fillStyle = 'rgba(200,220,255,0.04)';
            ctx.beginPath();
            ctx.arc(a.x, a.y, 2, 0, Math.PI*2);
            ctx.fill();

            let connections = 0;
            for(let j=i+1;j<points.length && connections < 5;j++){
                const b = points[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.hypot(dx,dy);
                if(dist < maxDist){
                    const alpha = (1 - dist / maxDist) * 0.15;
                    ctx.strokeStyle = 'rgba(170,200,255,'+alpha+')';
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                    connections++;
                }
            }
        }

        // no cursor-connected highlights or CSS variable writes here

        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

})();