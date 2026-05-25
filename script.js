// GAME LOGIC
 
// STATE
const state = {
    difficulty: null,
    currentScene: 0,
    score: 0,
    timer: 90,
    timerInterval: null,
    answered: false,
    tries: 3,
    level: 5,
    round: 1,
    pauseActive: false,
    usedProblems: {} // tracks used problem indices per difficulty/scene
};
 
const SCENES = ['Point', 'Rebound', 'Assist', 'Steal', 'Block'];
 
const PLAYERS = {
    1:  { name: "Brian Scalabrine",  end: true,  endType: "lose", img: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Brian_Scalabrine_of_the_Boston_Celtics_at_NBA_Media_Day_2007.png" },
    2:  { name: "Luc Mbah a Moute", advantage: "extra_time",      img: "https://upload.wikimedia.org/wikipedia/commons/6/65/Luc_Mbah_a_Moute_%2830924863043%29_%28cropped%29.jpg" },
    3:  { name: "Goga Bitadze",      advantage: "lenient",         img: "https://upload.wikimedia.org/wikipedia/commons/1/15/Goga_Bitadze_Orlando_Magic_2025_%28cropped%29.jpg" },
    4:  { name: "Andrew Nembhard",   advantage: "pause",           img: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Andrew_Nembhard_Gonzaga_%28cropped%29.jpg" },
    5:  { name: "Derrick White",     advantage: "extra_attempt",   img: "https://upload.wikimedia.org/wikipedia/commons/d/db/Boston_Celtics_player_Derrick_White_on_November_21%2C_2024_at_the_White_House_%28cropped%29.jpg" },
    6:  { name: "Domantas Sabonis",  disadvantage: "precise",      img: "https://upload.wikimedia.org/wikipedia/commons/0/05/Domantas_Sabonis_by_Augustas_Didzgalvis_%28cropped%29.jpg" },
    7:  { name: "Jalen Brunson",     disadvantage: "two_attempts", img: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Jalen_Brunson_2023_%28cropped%29.jpg" },
    8:  { name: "Dwyane Wade",       disadvantage: "short_timer",  img: "https://upload.wikimedia.org/wikipedia/commons/7/73/Dwyane_Wade_e1.jpg" },
    9:  { name: "Larry Bird",        disadvantage: "blind",        img: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Larrybird.jpg" },
    10: { name: "LeBron James",      end: true,  endType: "win",   img: "https://upload.wikimedia.org/wikipedia/commons/7/7a/LeBron_James_%2851959977144%29_%28cropped2%29.jpg" }
};
 
const LEVEL_DESCRIPTIONS = {
    1:  "💀 Brian Scalabrine — Game over, you suck!",
    2:  "🟢 Luc Mbah a Moute — +30 bonus seconds!",
    3:  "🟢 Goga Bitadze — ±5% answer tolerance!",
    4:  "🟢 Andrew Nembhard — Wrong answer pauses timer for 5s!",
    5:  "🟢 Derrick White — 4 attempts per question!",
    6:  "🔴 Domantas Sabonis — Only ±1% tolerance!",
    7:  "🔴 Jalen Brunson — Only 2 attempts!",
    8:  "🔴 Dwyane Wade — Timer starts at 75 seconds!",
    9:  "🔴 Larry Bird — Problem hidden for 20 seconds!",
    10: "🏆 LeBron James — You are THE GOAT!"
};
 
// ============================================================
// PROBLEMS — 5 per scene per difficulty = 75 total
// ============================================================
const PROBLEMS = {
    easy: {
        Point: [
            {
                question: "You shoot a basketball from the free-throw line, 4.6 m from the hoop, at an angle of 45°. If the ball leaves your hand at a height of 2.0 m and the hoop is at 3.05 m, what initial speed do you need?",
                answer: 7.2,
                unit: "m/s"
            },
            {
                question: "You release a jump shot with an initial velocity of 8.0 m/s at 50° above horizontal. How long is the ball in the air before reaching the hoop 4.0 m away horizontally?",
                answer: 0.78,
                unit: "s"
            },
            {
                question: "A basketball of mass 0.62 kg leaves your hand with a speed of 7.5 m/s. What is the kinetic energy of the ball at release?",
                answer: 17.4,
                unit: "J"
            },
            {
                question: "You shoot the ball straight up with an initial speed of 6.0 m/s from a height of 2.2 m. What is the maximum height the ball reaches above the ground? (g = 9.8 m/s²)",
                answer: 4.04,
                unit: "m"
            },
            {
                question: "A 0.62 kg basketball is pushed with a net force of 18 N for 0.3 s from rest. What speed does it leave your hand?",
                answer: 8.71,
                unit: "m/s"
            }
        ],
        Rebound: [
            {
                question: "A basketball falls from the rim, at height 3.05 m, straight down. What is its speed just before hitting the ground?",
                answer: 7.73,
                unit: "m/s"
            },
            {
                question: "You jump straight up to grab a rebound, reaching a maximum height of 0.65 m. What was your takeoff speed?",
                answer: 3.57,
                unit: "m/s"
            },
            {
                question: "A 0.62 kg basketball bounces off the backboard. If it hits at 5.0 m/s and rebounds at 3.5 m/s, what is the magnitude of the change in momentum?",
                answer: 5.27,
                unit: "kg·m/s"
            },
            {
                question: "A basketball is dropped from rest and hits the floor after falling 2.4 m. How long does it take to fall? (g = 9.8 m/s²)",
                answer: 0.70,
                unit: "s"
            },
            {
                question: "You apply an average upward force of 220 N on a 0.62 kg basketball for 0.08 s to tip it toward the hoop. What is the impulse delivered to the ball?",
                answer: 17.6,
                unit: "N·s"
            }
        ],
        Assist: [
            {
                question: "You throw a chest pass horizontally at 12 m/s to a teammate 6.0 m away. How far does the ball drop vertically during the pass?",
                answer: 1.23,
                unit: "m"
            },
            {
                question: "You apply a force of 40 N to a 0.62 kg basketball during a 0.15 s pass. What is the speed of the ball when it leaves your hands (starting from rest)?",
                answer: 9.68,
                unit: "m/s"
            },
            {
                question: "A bounce pass travels 8.0 m horizontally at a speed of 10 m/s. How long does the pass take?",
                answer: 0.80,
                unit: "s"
            },
            {
                question: "You pass a 0.62 kg ball to a teammate. The ball goes from rest to 9.0 m/s. How much work did you do on the ball?",
                answer: 25.11,
                unit: "J"
            },
            {
                question: "A defender is 2.5 m away from your teammate and running toward them at 4.0 m/s. You throw a pass at 10 m/s over a 5.0 m distance. If the ball arrives before the defender, enter the ball's travel time. If not, enter '0'",
                answer: 0.50,
                unit: "s"
            }
        ],
        Steal: [
            {
                question: "You accelerate from rest at 4.5 m/s² to intercept a pass. How fast are you moving after 1.2 seconds?",
                answer: 5.4,
                unit: "m/s"
            },
            {
                question: "To steal the ball, you need to cover 3.0 m from a standing start. If you accelerate uniformly at 5.0 m/s², how long does it take?",
                answer: 1.10,
                unit: "s"
            },
            {
                question: "You (75 kg) lunge at 3.0 m/s to steal the ball. What is your kinetic energy?",
                answer: 337.5,
                unit: "J"
            },
            {
                question: "An opponent dribbles the ball downward at 6.0 m/s and it bounces back up. If the contact time with the floor is 0.04 s and the ball (0.62 kg) returns at 5.5 m/s upward, what is the average force from the floor?",
                answer: 178.3,
                unit: "N"
            },
            {
                question: "You lunge 1.8 m to reach the ball, starting from rest and accelerating uniformly. If you reach the ball in 0.9 s, what was your acceleration?",
                answer: 4.44,
                unit: "m/s²"
            }
        ],
        Block: [
            {
                question: "You jump to block a shot, reaching a height of 0.90 m above the ground from your jump point. How long are you in the air (total up and down)?",
                answer: 0.86,
                unit: "s"
            },
            {
                question: "A 0.62 kg basketball is moving at 8.0 m/s toward the hoop. You block it, bringing it to rest in 0.05 s. What average force did you apply?",
                answer: 99.2,
                unit: "N"
            },
            {
                question: "You need to reach a height of 3.2 m (your hand height) to block a shot. If your standing reach is 2.4 m, what vertical jump speed do you need?",
                answer: 3.96,
                unit: "m/s"
            },
            {
                question: "You (80 kg) jump with a takeoff speed of 3.2 m/s. What is your gravitational potential energy at the peak of your jump? (g = 9.8 m/s²)",
                answer: 399.6,
                unit: "J"
            },
            {
                question: "A 0.62 kg ball is shot at 7.0 m/s. You deflect it so it moves at 4.0 m/s in the opposite direction. What is the magnitude of the change in the ball's momentum?",
                answer: 6.82,
                unit: "kg·m/s"
            }
        ]
    },
 
    medium: {
        Point: [
            {
                question: "You shoot a 3-pointer from 7.24 m away at 52° above horizontal with initial speed 9.5 m/s. The ball leaves at height 2.1 m. What is the maximum height reached by the ball? (g = 9.8 m/s²)",
                answer: 4.96,
                unit: "m"
            },
            {
                question: "A 0.62 kg basketball moving at 6.0 m/s hits the rim (which acts like a spring with k = 2500 N/m) and compresses it by some amount before bouncing back. What is the maximum compression of the rim?",
                answer: 0.047,
                unit: "m"
            },
            {
                question: "You shoot with initial speed 8.5 m/s at 48°. The ball travels 4.8 m horizontally to reach the hoop. What is the ball's speed at the highest point of its trajectory? (g = 9.8 m/s²)",
                answer: 5.69,
                unit: "m/s"
            },
            {
                question: "A basketball leaves your hand at 9.0 m/s at 40° above horizontal from height 2.0 m. What is the ball's height above the ground after traveling 5.0 m horizontally? (g = 9.8 m/s²)",
                answer: 2.84,
                unit: "m"
            },
            {
                question: "You shoot from the free throw line (4.6 m away). The ball leaves at 2.0 m height and 45°. Using energy conservation, what is the ball's speed when it reaches hoop height of 3.05 m? (Initial speed = 7.2 m/s, g = 9.8 m/s²)",
                answer: 5.74,
                unit: "m/s"
            }
        ],
        Rebound: [
            {
                question: "A 0.62 kg basketball hits the backboard at 7.0 m/s at 30° to the normal and rebounds at 5.0 m/s at 30° to the normal. What is the magnitude of the impulse on the ball?",
                answer: 6.45,
                unit: "N·s"
            },
            {
                question: "You (80 kg) jump with initial speed 4.0 m/s upward to grab a rebound. An opponent (90 kg) jumps at 3.5 m/s. If you collide at your peak heights and stick together, what is your combined velocity just after collision?",
                answer: 0,
                unit: "m/s"
            },
            {
                question: "A basketball drops from 3.05 m and bounces back to 1.8 m. If the ball's mass is 0.62 kg, how much energy was lost in the bounce? (g = 9.8 m/s²)",
                answer: 7.59,
                unit: "J"
            },
            {
                question: "A 0.62 kg ball falls from 3.05 m. It bounces and returns to 2.1 m. What is the coefficient of restitution (ratio of rebound speed to impact speed)?",
                answer: 0.83,
                unit: ""
            },
            {
                question: "You (78 kg) are at rest and jump to get a rebound, grabbing the ball (0.62 kg) moving downward at 6.0 m/s. Using conservation of momentum, what is your velocity immediately after grabbing the ball?",
                answer: 0.047,
                unit: "m/s"
            }
        ],
        Assist: [
            {
                question: "You throw a lob pass at 10 m/s at 60° above horizontal from a height of 1.8 m. Your teammate catches it at the same height. What horizontal distance does the ball travel? (g = 9.8 m/s²)",
                answer: 8.83,
                unit: "m"
            },
            {
                question: "A 0.62 kg ball is passed at 14 m/s. Air resistance provides a constant opposing force of 0.3 N. What is the ball's speed after traveling 8.0 m?",
                answer: 13.7,
                unit: "m/s"
            },
            {
                question: "You pass the ball at 11 m/s horizontally from 2.0 m height. Your teammate catches it at 1.0 m height, 9.0 m away. What is the ball's speed when caught? (g = 9.8 m/s²)",
                answer: 11.4,
                unit: "m/s"
            },
            {
                question: "You throw a bounce pass that hits the floor at 7.0 m/s at 40° below horizontal. The ball rebounds elastically (same speed, angle reflected). What is the horizontal component of the ball's velocity after the bounce?",
                answer: 5.36,
                unit: "m/s"
            },
            {
                question: "You push a 0.62 kg ball from rest over 0.5 m with a constant force. It leaves your hand at 8.0 m/s. What constant force did you apply? (Use work-energy theorem)",
                answer: 39.68,
                unit: "N"
            }
        ],
        Steal: [
            {
                question: "You (70 kg) are running at 5.0 m/s and reach for the ball (0.62 kg, moving at 8.0 m/s in the same direction). After the steal, you and the ball move together. What is your final speed?",
                answer: 5.03,
                unit: "m/s"
            },
            {
                question: "To intercept a pass, you need to cover 4.5 m. You start at 2.0 m/s and accelerate at 3.0 m/s². How long does it take to cover the distance?",
                answer: 1.09,
                unit: "s"
            },
            {
                question: "You apply a tangential force of 8.0 N to knock the ball (0.62 kg, radius 0.12 m) from an opponent's hand. Treating the ball as a solid sphere (I = 2/5 mr²), what is the resulting angular acceleration?",
                answer: 268,
                unit: "rad/s²"
            },
            {
                question: "An opponent (85 kg) is moving at 3.5 m/s. You (75 kg) run at 4.5 m/s toward them and collide, both stopping. Is momentum conserved? What is the total momentum before the collision?",
                answer: 0,
                unit: "kg·m/s"
            },
            {
                question: "You need to cut off a passing lane 6.0 m away. Starting from rest with acceleration 4.0 m/s², how fast are you moving when you arrive?",
                answer: 6.93,
                unit: "m/s"
            }
        ],
        Block: [
            {
                question: "A player shoots a basketball from 3.0 m height. You jump and block the ball at its peak height of 4.2 m, 0.5 s after it was shot. What was the vertical component of the ball's initial velocity? (g = 9.8 m/s²)",
                answer: 4.85,
                unit: "m/s"
            },
            {
                question: "You block a shot by applying an upward force of 150 N to a 0.62 kg basketball. If the ball was moving downward at 4.0 m/s and you reverse its direction to 2.0 m/s upward, how long was your hand in contact with the ball?",
                answer: 0.025,
                unit: "s"
            },
            {
                question: "You jump to block a shot, spending 0.4 s moving upward to your peak height. What was your takeoff kinetic energy if your mass is 85 kg? (g = 9.8 m/s²)",
                answer: 653.1,
                unit: "J"
            },
            {
                question: "A 0.62 kg ball is traveling at 9.0 m/s toward the hoop. You block it, redirecting it horizontally at 6.0 m/s perpendicular to its original path. What is the magnitude of the impulse you delivered?",
                answer: 6.71,
                unit: "N·s"
            },
            {
                question: "You (82 kg) jump from rest and reach a peak height of 0.75 m. What was the average net upward force during your 0.35 s push-off phase? (g = 9.8 m/s²)",
                answer: 1052,
                unit: "N"
            }
        ]
    },
 
    hard: {
        Point: [
            {
                question: "During a shot, the force on the ball varies as F(t) = 120t - 200t² (N) for 0 ≤ t ≤ 0.4 s. If the 0.62 kg ball starts from rest, what is its speed at t = 0.4 s? (Integrate F(t) to find impulse)",
                answer: 7.74,
                unit: "m/s"
            },
            {
                question: "A basketball (solid sphere, m = 0.62 kg, r = 0.12 m) rolls without slipping off a table at 3.0 m/s. Using I = 2/5 mr² and total KE = ½mv² + ½Iω², what is the total kinetic energy as it leaves the table?",
                answer: 3.91,
                unit: "J"
            },
            {
                question: "The ball's height during a shot follows h(t) = 2.0 + 6.5t - 4.9t². Find the ball's speed (magnitude of velocity vector) at t = 0.8 s if horizontal velocity is constant at 5.5 m/s.",
                answer: 5.97,
                unit: "m/s"
            },
            {
                question: "A force F(t) = 60 + 80t (N) acts on a 0.62 kg ball from t = 0 to t = 0.25 s. The ball starts from rest. What is its final speed? (Integrate F/m over time)",
                answer: 28.23,
                unit: "m/s"
            },
            {
                question: "The ball follows a trajectory where horizontal position is x(t) = 6t and vertical position is y(t) = 1.8 + 7t - 4.9t² (meters). At what time does the ball reach its maximum height, and what is that maximum height?",
                answer: 4.31,
                unit: "m"
            }
        ],
        Rebound: [
            {
                question: "During a rebound, the force between ball and backboard varies as F(t) = 5000t·e^(-50t) N. Calculate the total impulse (integrate from 0 to ∞). (Hint: ∫₀^∞ t·e^(-at) dt = 1/a²)",
                answer: 2.0,
                unit: "N·s"
            },
            {
                question: "A basketball (I = 2/5 mr², m = 0.62 kg, r = 0.12 m) spinning at 15 rad/s hits the backboard. Friction decelerates it at α = -50 rad/s². What is the rotational kinetic energy lost by the time it stops spinning?",
                answer: 0.40,
                unit: "J"
            },
            {
                question: "You jump for a rebound with velocity v(t) = 4.0 - 9.8t (m/s, upward positive). Your position is y(t) = 4.0t - 4.9t². What is your maximum height above the ground?",
                answer: 0.816,
                unit: "m"
            },
            {
                question: "The contact force between ball and rim during a bounce is F(t) = 3000sin(πt/0.06) N for 0 ≤ t ≤ 0.06 s. What is the total impulse delivered? (∫₀^0.06 3000sin(πt/0.06) dt)",
                answer: 114.6,
                unit: "N·s"
            },
            {
                question: "A ball (m = 0.62 kg) hits the floor with velocity components vx = 4.0 m/s, vy = -6.0 m/s. After bouncing, vy reverses and is reduced by 20% (coefficient of restitution = 0.8), vx unchanged. What is the ball's speed after the bounce?",
                answer: 6.4,
                unit: "m/s"
            }
        ],
        Assist: [
            {
                question: "During a pass, your arm exerts a force F(t) = 80cos(πt/0.3) N for 0 ≤ t ≤ 0.15 s on the 0.62 kg ball (initially at rest). What is the ball's final speed? (Integrate: ∫₀^0.15 80cos(πt/0.3)dt)",
                answer: 12.3,
                unit: "m/s"
            },
            {
                question: "A pass experiences air drag F_drag = -0.05v² (N) on a 0.62 kg ball with initial speed 14 m/s. Using the approximation v ≈ v₀/(1 + (0.05·v₀·t)/m), find the speed after 0.5 s.",
                answer: 12.9,
                unit: "m/s"
            },
            {
                question: "A bounce pass hits the floor at angle 35° with speed 10 m/s. The coefficient of restitution is 0.85 (only affects vertical component). At what angle does it leave the floor?",
                answer: 30.5,
                unit: "degrees"
            },
            {
                question: "You throw a pass and your wrist exerts torque τ(t) = 4.0 - 20t (N·m) on the ball (treated as solid sphere, I = 2/5 mr², m = 0.62 kg, r = 0.12 m) from t = 0 to t = 0.2 s. What is the ball's final angular velocity? (Integrate τ/I)",
                answer: 268,
                unit: "rad/s"
            },
            {
                question: "Your hand moves along x(t) = 0.4t² + 0.3t³ during a pass (meters, 0 ≤ t ≤ 0.4 s). The 0.62 kg ball is in contact the whole time. What is the net force on the ball at t = 0.3 s? (F = ma, a = x''(t))",
                answer: 1.61,
                unit: "N"
            }
        ],
        Steal: [
            {
                question: "You accelerate with a time-varying force F(t) = 300 - 40t (N) applied to your 75 kg body. Starting from rest, what is your velocity at t = 3.0 s? (Integrate F/m from 0 to 3)",
                answer: 9.6,
                unit: "m/s"
            },
            {
                question: "The ball (m = 0.62 kg, r = 0.12 m, I = 2/5mr²) is spinning at ω = 20 rad/s while moving at 6 m/s. You apply a torque τ = -3.0 N·m for 0.05 s. What is the new angular velocity?",
                answer: -30.2,
                unit: "rad/s"
            },
            {
                question: "You lunge with position x(t) = 0.5t² + 0.2t³ (meters). What is your acceleration at t = 1.5 s? (Take second derivative)",
                answer: 2.8,
                unit: "m/s²"
            },
            {
                question: "You (75 kg) start from rest. A force F(t) = 400e^(-2t) N pushes you forward. What is your velocity at t = 1.0 s? (∫₀^1 F/m dt)",
                answer: 3.16,
                unit: "m/s"
            },
            {
                question: "An opponent's hand position while dribbling follows y(t) = 0.9 - 0.4cos(4πt) m. What is the maximum speed of their hand during the dribble? (Take dy/dt and find its maximum)",
                answer: 5.03,
                unit: "m/s"
            }
        ],
        Block: [
            {
                question: "During a block, your hand exerts force F(t) = 800sin(πt/0.02) N on the ball for 0 ≤ t ≤ 0.02 s. The ball mass is 0.62 kg and initial speed is 8 m/s. What is the ball's final speed? (Ball reverses direction; impulse = ∫F dt)",
                answer: 8.4,
                unit: "m/s"
            },
            {
                question: "You (80 kg) jump and your center of mass follows y(t) = 3.8t - 4.9t² (m) after leaving the ground. What is the maximum height of your center of mass above the launch point?",
                answer: 0.737,
                unit: "m"
            },
            {
                question: "A spinning basketball (I = 2/5 mr², m = 0.62 kg, r = 0.12 m) has angular momentum L = Iω = 0.15 kg·m²/s. You apply a torque that decreases as τ(t) = 2.0e^(-10t) N·m. After a long time, what total angular impulse is delivered? (∫₀^∞ τ dt)",
                answer: 0.20,
                unit: "N·m·s"
            },
            {
                question: "Your jump height follows h(t) = v₀t - 4.9t² where v₀ is determined by the condition that dh/dt = 0 at t = 0.45 s. What is your maximum height?",
                answer: 0.992,
                unit: "m"
            },
            {
                question: "A ball (0.62 kg) is shot at v = 10 m/s at 60° above horizontal. You block it at its peak, pushing it horizontally in the opposite direction at 5.0 m/s. What impulse did you deliver? (Find change in momentum vector magnitude)",
                answer: 6.35,
                unit: "N·s"
            }
        ]
    }
};
 
// ============================================================
// SVG SCENES
// ============================================================
function getSceneSVG(sceneName) {
    const svgs = {
        Point: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="200" fill="#1a1a2e"/>
            <rect x="0" y="160" width="400" height="40" fill="#c4a35a" opacity="0.6"/>
            <line x1="0" y1="160" x2="400" y2="160" stroke="#a68b3e" stroke-width="2"/>
            <rect x="320" y="40" width="8" height="70" fill="#ffffff"/>
            <rect x="290" y="95" width="40" height="3" fill="#ff6b35"/>
            <ellipse cx="310" cy="97" rx="18" ry="5" fill="none" stroke="#ff6b35" stroke-width="2"/>
            <path d="M292 100 L298 120 M300 100 L303 120 M310 100 L310 120 M320 100 L317 120 M328 100 L322 120" stroke="#ffffff" stroke-width="1" opacity="0.6"/>
            <path d="M80 140 Q200 20 305 95" stroke="#ff6b35" stroke-width="2" stroke-dasharray="5,5" fill="none"/>
            <circle cx="80" cy="140" r="12" fill="#ff6b35"/>
            <path d="M40 170 Q60 155 80 150" stroke="#d4a574" stroke-width="8" stroke-linecap="round" fill="none"/>
            <path d="M120 170 Q100 155 80 150" stroke="#d4a574" stroke-width="8" stroke-linecap="round" fill="none"/>
            <path d="M80 140 L100 140" stroke="#c4a35a" stroke-width="1"/>
            <path d="M80 140 L92 128" stroke="#c4a35a" stroke-width="1"/>
            <text x="95" y="135" fill="#c4a35a" font-size="10">θ</text>
        </svg>`,
        Rebound: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="200" fill="#1a1a2e"/>
            <rect x="0" y="160" width="400" height="40" fill="#c4a35a" opacity="0.6"/>
            <rect x="180" y="20" width="60" height="45" fill="#ffffff" opacity="0.9" rx="2"/>
            <rect x="190" y="55" width="40" height="3" fill="#ff6b35"/>
            <ellipse cx="210" cy="58" rx="18" ry="5" fill="none" stroke="#ff6b35" stroke-width="2"/>
            <circle cx="210" cy="35" r="12" fill="#ff6b35"/>
            <path d="M150 190 Q160 130 180 80" stroke="#d4a574" stroke-width="10" stroke-linecap="round" fill="none"/>
            <path d="M250 190 Q240 130 225 80" stroke="#d4a574" stroke-width="10" stroke-linecap="round" fill="none"/>
            <circle cx="180" cy="78" r="8" fill="#d4a574"/>
            <circle cx="225" cy="78" r="8" fill="#d4a574"/>
            <ellipse cx="320" cy="140" rx="15" ry="30" fill="#4a4a6a"/>
            <circle cx="320" cy="105" r="10" fill="#d4a574"/>
        </svg>`,
        Assist: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="200" fill="#1a1a2e"/>
            <rect x="0" y="160" width="400" height="40" fill="#c4a35a" opacity="0.6"/>
            <line x1="200" y1="160" x2="200" y2="200" stroke="#ffffff" stroke-width="1" opacity="0.3"/>
            <ellipse cx="200" cy="160" rx="40" ry="15" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.3"/>
            <circle cx="200" cy="120" r="12" fill="#ff6b35"/>
            <path d="M80 145 L190 122" stroke="#c4a35a" stroke-width="2" stroke-dasharray="6,3"/>
            <ellipse cx="320" cy="130" rx="15" ry="30" fill="#4a4a6a"/>
            <circle cx="320" cy="95" r="12" fill="#d4a574"/>
            <path d="M305 120 L295 135" stroke="#d4a574" stroke-width="4" stroke-linecap="round"/>
            <path d="M335 120 L345 135" stroke="#d4a574" stroke-width="4" stroke-linecap="round"/>
            <path d="M30 190 Q50 160 85 145" stroke="#d4a574" stroke-width="9" stroke-linecap="round" fill="none"/>
            <path d="M130 190 Q110 160 90 145" stroke="#d4a574" stroke-width="9" stroke-linecap="round" fill="none"/>
        </svg>`,
        Steal: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="200" fill="#1a1a2e"/>
            <rect x="0" y="160" width="400" height="40" fill="#c4a35a" opacity="0.6"/>
            <ellipse cx="250" cy="130" rx="18" ry="35" fill="#4a4a6a"/>
            <circle cx="250" cy="90" r="13" fill="#d4a574"/>
            <circle cx="270" cy="150" r="12" fill="#ff6b35"/>
            <path d="M50 190 Q100 170 150 155 Q200 140 260 148" stroke="#d4a574" stroke-width="9" stroke-linecap="round" fill="none"/>
            <line x1="100" y1="155" x2="60" y2="158" stroke="#ffffff" stroke-width="1" opacity="0.5"/>
            <line x1="120" y1="148" x2="80" y2="151" stroke="#ffffff" stroke-width="1" opacity="0.5"/>
            <line x1="110" y1="162" x2="70" y2="165" stroke="#ffffff" stroke-width="1" opacity="0.5"/>
            <text x="140" y="180" fill="#c4a35a" font-size="11" font-style="italic">lunging</text>
        </svg>`,
        Block: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="200" fill="#1a1a2e"/>
            <rect x="0" y="160" width="400" height="40" fill="#c4a35a" opacity="0.6"/>
            <rect x="300" y="30" width="6" height="50" fill="#ffffff" opacity="0.5"/>
            <rect x="270" y="70" width="35" height="2" fill="#ff6b35" opacity="0.5"/>
            <ellipse cx="220" cy="120" rx="16" ry="32" fill="#4a4a6a"/>
            <circle cx="220" cy="83" r="12" fill="#d4a574"/>
            <path d="M230 95 Q240 80 245 65" stroke="#d4a574" stroke-width="5" stroke-linecap="round" fill="none"/>
            <circle cx="248" cy="60" r="12" fill="#ff6b35"/>
            <path d="M100 200 Q120 140 160 80 Q180 50 240 55" stroke="#d4a574" stroke-width="11" stroke-linecap="round" fill="none"/>
            <line x1="250" y1="45" x2="260" y2="35" stroke="#ffffff" stroke-width="2"/>
            <line x1="260" y1="55" x2="275" y2="50" stroke="#ffffff" stroke-width="2"/>
            <line x1="245" y1="50" x2="240" y2="38" stroke="#ffffff" stroke-width="2"/>
        </svg>`
    };
    return svgs[sceneName] || '';
}
 
// ============================================================
// DOM ELEMENTS
// ============================================================
const screens = {
    difficulty: document.getElementById('screen-difficulty'),
    game: document.getElementById('screen-game'),
    grade: document.getElementById('screen-grade')
};
 
const elements = {
    sceneLabel: document.getElementById('scene-label'),
    sceneName: document.getElementById('scene-name'),
    timer: document.getElementById('timer'),
    score: document.getElementById('score'),
    sceneSvg: document.getElementById('scene-svg'),
    problemText: document.getElementById('problem-text'),
    answerInput: document.getElementById('answer-input'),
    answerUnit: document.getElementById('answer-unit'),
    submitBtn: document.getElementById('submit-btn'),
    feedback: document.getElementById('feedback'),
    gradeLetter: document.getElementById('grade-letter'),
    finalScore: document.getElementById('final-score'),
    gradeMessage: document.getElementById('grade-message'),
    playAgainBtn: document.getElementById('play-again-btn'),
    timerContainer: document.querySelector('.timer-container'),
    playerBanner: document.getElementById('player-banner')
};
 
// ============================================================
// HELPERS
// ============================================================
function getModifier() {
    return PLAYERS[state.level];
}
 
function getStartTimer() {
    const mod = getModifier();
    if (mod.advantage === 'extra_time') return 120;
    if (mod.disadvantage === 'short_timer') return 75;
    return 90;
}
 
function getMaxTries() {
    const mod = getModifier();
    if (mod.advantage === 'extra_attempt') return 4;
    if (mod.disadvantage === 'two_attempts') return 2;
    return 3;
}
 
function getTolerance(correctAnswer) {
    const mod = getModifier();
    if (mod.advantage === 'lenient') return Math.abs(correctAnswer) * 0.05;
    if (mod.disadvantage === 'precise') return Math.abs(correctAnswer) * 0.01;
    return Math.abs(correctAnswer) * 0.02;
}
 
function showScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenName].classList.add('active');
}
 
// ============================================================
// PROBLEM SELECTION WITH NO-REPEAT TRACKING
// ============================================================
function initUsedProblems() {
    state.usedProblems = {};
    ['easy','medium','hard'].forEach(diff => {
        state.usedProblems[diff] = {};
        SCENES.forEach(scene => {
            state.usedProblems[diff][scene] = [];
        });
    });
}
 
function selectProblem(sceneName, difficulty) {
    const problems = PROBLEMS[difficulty][sceneName];
    const used = state.usedProblems[difficulty][sceneName];
    const available = problems.map((_, i) => i).filter(i => !used.includes(i));
 
    // If all used (shouldn't happen with 5 problems and max 5 rounds), reset
    if (available.length === 0) {
        state.usedProblems[difficulty][sceneName] = [];
        available.push(...problems.map((_, i) => i));
    }
 
    const idx = available[Math.floor(Math.random() * available.length)];
    state.usedProblems[difficulty][sceneName].push(idx);
    return problems[idx];
}
 
// ============================================================
// GAME START
// ============================================================
function startGame(difficulty) {
    const startLevels = { easy: 7, medium: 5, hard: 3 };
    state.difficulty = difficulty;
    state.currentScene = 0;
    state.score = 0;
    state.answered = false;
    state.level = startLevels[difficulty];
    state.round = 1;
    initUsedProblems();
    showScreen('game');
    loadScene();
}
 
function loadScene() {
    const player = PLAYERS[state.level];
    if (player.end) { showGrade(); return; }
 
    const sceneName = SCENES[state.currentScene];
    const problem = selectProblem(sceneName, state.difficulty);
 
    state.currentProblem = problem;
    state.answered = false;
    state.pauseActive = false;
    state.timer = getStartTimer();
    state.tries = getMaxTries();
 
    elements.sceneLabel.textContent = `Round ${state.round}/5 — Scene ${state.currentScene + 1}/5`;
    elements.sceneName.textContent = sceneName;
    elements.score.textContent = state.score;
    elements.timer.textContent = state.timer;
 
    if (elements.playerBanner) {
        elements.playerBanner.textContent = `🏀 ${PLAYERS[state.level].name} (Level ${state.level}) — ${LEVEL_DESCRIPTIONS[state.level].split('—')[1].trim()}`;
    }
 
    elements.sceneSvg.innerHTML = getSceneSVG(sceneName);
    elements.answerUnit.textContent = problem.unit;
    elements.answerInput.value = '';
    elements.answerInput.disabled = false;
    elements.submitBtn.disabled = false;
    elements.feedback.classList.add('hidden');
    elements.feedback.classList.remove('correct', 'incorrect');
    elements.timerContainer.classList.remove('warning');
 
    const mod = getModifier();
    if (mod.disadvantage === 'blind') {
        elements.problemText.textContent = problem.question;
        elements.problemText.style.filter = 'blur(6px)';
        elements.problemText.style.userSelect = 'none';
        elements.answerInput.disabled = true;
        elements.submitBtn.disabled = true;
        elements.feedback.textContent = '👁️ Larry Bird is blocking your view! Problem revealed in 20 seconds...';
        elements.feedback.classList.remove('hidden', 'correct');
        elements.feedback.classList.add('incorrect');
        setTimeout(() => {
            elements.problemText.style.filter = 'none';
            elements.problemText.style.userSelect = '';
            elements.answerInput.disabled = false;
            elements.submitBtn.disabled = false;
            elements.feedback.classList.add('hidden');
            elements.answerInput.focus();
        }, 20000);
    } else {
        elements.problemText.style.filter = 'none';
        elements.problemText.style.userSelect = '';
        elements.problemText.textContent = problem.question;
    }
 
    clearInterval(state.timerInterval);
    state.timerInterval = setInterval(updateTimer, 1000);
    if (mod.disadvantage !== 'blind') elements.answerInput.focus();
}
 
function updateTimer() {
    if (state.pauseActive) return;
    state.timer--;
    elements.timer.textContent = state.timer;
    if (state.timer <= 15) elements.timerContainer.classList.add('warning');
    if (state.timer <= 0) {
        clearInterval(state.timerInterval);
        if (!state.answered) handleTimeout();
    }
}
 
function handleTimeout() {
    state.answered = true;
    elements.answerInput.disabled = true;
    elements.submitBtn.disabled = true;
    elements.feedback.textContent = `⏰ Time's up! The correct answer was ${state.currentProblem.answer} ${state.currentProblem.unit}`;
    elements.feedback.classList.remove('hidden', 'correct');
    elements.feedback.classList.add('incorrect');
    setTimeout(nextScene, 2500);
}
 
function checkAnswer() {
    if (state.answered) return;
    const userAnswer = parseFloat(elements.answerInput.value);
    if (isNaN(userAnswer)) {
        elements.feedback.textContent = '⚠️ Please enter a valid number.';
        elements.feedback.classList.remove('hidden', 'correct', 'incorrect');
        elements.feedback.classList.add('incorrect');
        return;
    }
 
    const correctAnswer = state.currentProblem.answer;
    const tolerance = getTolerance(correctAnswer);
    const isCorrect = Math.abs(userAnswer - correctAnswer) <= Math.max(tolerance, 0.01);
 
    if (isCorrect) {
        state.answered = true;
        clearInterval(state.timerInterval);
        elements.answerInput.disabled = true;
        elements.submitBtn.disabled = true;
        state.score++;
        elements.score.textContent = state.score;
        elements.feedback.textContent = '✅ Correct! Great physics!';
        elements.feedback.classList.remove('hidden', 'incorrect');
        elements.feedback.classList.add('correct');
        setTimeout(nextScene, 2000);
    } else {
        state.tries--;
        const mod = getModifier();
        if (state.tries > 0) {
            if (mod.advantage === 'pause') {
                state.pauseActive = true;
                elements.feedback.textContent = `❌ Incorrect. ${state.tries} attempt${state.tries > 1 ? 's' : ''} remaining. (Timer paused 5s)`;
                setTimeout(() => { state.pauseActive = false; }, 5000);
            } else {
                state.timer = Math.max(0, state.timer - 10);
                elements.timer.textContent = state.timer;
                elements.feedback.textContent = `❌ Incorrect. ${state.tries} attempt${state.tries > 1 ? 's' : ''} remaining. (-10s)`;
                if (state.timer <= 0) {
                    clearInterval(state.timerInterval);
                    handleTimeout();
                    return;
                }
            }
            elements.feedback.classList.remove('hidden', 'correct');
            elements.feedback.classList.add('incorrect');
            elements.answerInput.value = '';
            elements.answerInput.focus();
        } else {
            state.answered = true;
            clearInterval(state.timerInterval);
            elements.answerInput.disabled = true;
            elements.submitBtn.disabled = true;
            elements.feedback.textContent = `❌ No attempts remaining. The answer was ${correctAnswer} ${state.currentProblem.unit}`;
            elements.feedback.classList.remove('hidden', 'correct');
            elements.feedback.classList.add('incorrect');
            setTimeout(nextScene, 2500);
        }
    }
}
 
function nextScene() {
    state.currentScene++;
    if (state.currentScene >= 5) endRound();
    else loadScene();
}
 
function endRound() {
    const score = state.score;
    let levelChange = 0;
    if (score === 5) levelChange = 3;
    else if (score === 4) levelChange = 2;
    else if (score === 3) levelChange = 1;
    else if (score === 2) levelChange = 0;
    else if (score === 1) levelChange = -1;
    else levelChange = -2;
 
    state.level = Math.max(1, Math.min(10, state.level + levelChange));
 
    if (state.level === 10 || state.level === 1) { showGrade(); return; }
    if (state.round >= 5) { showGrade(); return; }
 
    showRoundSummary(score, levelChange);
}
 
function showRoundSummary(score, levelChange) {
    showScreen('grade');
    const player = PLAYERS[state.level];
    const arrow = levelChange > 0 ? '⬆️' : levelChange < 0 ? '⬇️' : '➡️';
    const nextRound = state.round + 1;
 
    elements.gradeLetter.textContent = `${score}/5`;
    elements.gradeLetter.style.fontSize = '2.5rem';
    document.querySelector('.grade-title').textContent = `Round ${state.round} Complete!`;
    document.querySelector('.grade-score').innerHTML = `You are now <strong style="color:#ff6b35">${player.name}</strong>`;
    elements.gradeMessage.textContent = `${arrow} ${LEVEL_DESCRIPTIONS[state.level].split('—')[1].trim()} ${levelChange >= 0 ? 'Keep balling — upgrade your player!' : 'Get more questions right to climb back up!'}`;
    // Show player image
    let imgEl = document.getElementById('player-img-summary');
    if (!imgEl) {
        imgEl = document.createElement('img');
        imgEl.id = 'player-img-summary';
        imgEl.style.cssText = 'width:120px;height:150px;object-fit:cover;object-position:top;border-radius:12px;margin:1rem auto 0;display:block;border:2px solid #ff6b35;';
        elements.gradeMessage.insertAdjacentElement('afterend', imgEl);
    }
    imgEl.src = player.img;
    imgEl.alt = player.name;
    elements.playAgainBtn.textContent = `Start Round ${nextRound} →`;
 
    state.round = nextRound;
    state.score = 0;
    state.currentScene = 0;
 
    const goNextRound = () => {
        elements.playAgainBtn.removeEventListener('click', goNextRound);
        elements.playAgainBtn.addEventListener('click', resetGame);
        elements.gradeLetter.style.fontSize = '4rem';
        document.querySelector('.grade-title').textContent = 'Game Over!';
        document.querySelector('.grade-score').innerHTML = `Level Reached: <span id="final-score">0</span>/10`;
        elements.playAgainBtn.textContent = 'Play Again';
        showScreen('game');
        loadScene();
    };
 
    elements.playAgainBtn.removeEventListener('click', resetGame);
    elements.playAgainBtn.addEventListener('click', goNextRound);
}
 
function showGrade() {
    clearInterval(state.timerInterval);
    showScreen('grade');
    elements.gradeLetter.style.fontSize = '4rem';
    document.querySelector('.grade-title').textContent = 'Game Over!';
    document.querySelector('.grade-score').innerHTML = `Level Reached: <span id="final-score">${state.level}</span>/10`;
    elements.playAgainBtn.textContent = 'Play Again';
    elements.playAgainBtn.onclick = resetGame;
 
    const player = PLAYERS[state.level];
    let letter, message;
    if (player.end && player.endType === 'win') {
        letter = '🐐';
        message = 'Congratulations! You are THE GOAT. LeBron would be proud.';
    } else if (player.end && player.endType === 'lose') {
        letter = 'F';
        message = "You suck! Better luck next time. Even Scalabrine is disappointed.";
    } else if (state.level >= 8) {
        letter = 'A';
        message = `Incredible run! You reached ${player.name}. Elite physics skills. 🌟`;
    } else if (state.level >= 6) {
        letter = 'B';
        message = `Solid work! You reached ${player.name}. Good physics fundamentals. 👍`;
    } else if (state.level >= 4) {
        letter = 'C';
        message = `Not bad. You reached ${player.name}. Keep grinding. 👟`;
    } else {
        letter = 'D';
        message = `Rough game. You reached ${player.name}. Hit the books! 📖`;
    }
 
    elements.gradeLetter.textContent = letter;
    elements.gradeMessage.textContent = message;
    // Show player image on final screen
    let imgEl = document.getElementById('player-img-summary');
    if (!imgEl) {
        imgEl = document.createElement('img');
        imgEl.id = 'player-img-summary';
        imgEl.style.cssText = 'width:120px;height:150px;object-fit:cover;object-position:top;border-radius:12px;margin:1rem auto 0;display:block;border:2px solid #ff6b35;';
        elements.gradeMessage.insertAdjacentElement('afterend', imgEl);
    }
    imgEl.src = player.img;
    imgEl.alt = player.name;
}
 
function resetGame() {
    clearInterval(state.timerInterval);
    elements.playAgainBtn.onclick = resetGame;
    elements.playAgainBtn.textContent = 'Play Again';
    elements.gradeLetter.style.fontSize = '4rem';
    document.querySelector('.grade-title').textContent = 'Game Over!';
    showScreen('difficulty');
}
 
// EVENT LISTENERS
document.querySelectorAll('[data-difficulty]').forEach(btn => {
    btn.addEventListener('click', () => startGame(btn.dataset.difficulty));
});
elements.submitBtn.addEventListener('click', checkAnswer);
elements.answerInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') checkAnswer(); });
elements.playAgainBtn.addEventListener('click', resetGame);