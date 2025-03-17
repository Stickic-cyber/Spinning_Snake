document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // 设置canvas尺寸
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 动画参数
    let angle = 0; // 当前旋转角度（弧度）
    let rotationDirection = 1; // 旋转方向（1顺时针/-1逆时针）

    // 获取当前关卡配置
    const currentLevel = 'level';
    const config = window.levelConfigs[currentLevel];
    config.center.x = canvas.width / 2;
    config.center.y = canvas.height / 2;

    const circles = config.circles.positions.map(pos => ({
        x: config.center.x + pos.x,
        y: config.center.y + pos.y,
        r: pos.radius || config.circles.baseRadius
    }));
    // 红色挡板数组
    const barriers = config.barriers.map(b => ({
        x: config.center.x + b.x,
        y: config.center.y + b.y,
        width: b.width,
        height: b.height,
        collisionRadius: b.collisionRadius
    }));
    // 黄色星星
    const star = {
        x: config.center.x + config.star.xOffset,
        y: config.center.y + config.star.yOffset,
        size: config.star.size,
        spike: config.star.spike
    };
    let victory = false;
    let currentCircleIndex = 0;
    // 添加飞行状态变量
    let isFlying = false;
    let velocity = { x: 0, y: 0 };
    let position = { x: 0, y: 0 };
    let gameOver = false;
    // 用于记录蓝色球的历史位置
    let trail = [];
    const trailLength = 12; // 拖尾长度

    // 鼠标点击事件
    document.addEventListener('click', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const currentCircle = circles[currentCircleIndex];
        const blueCirclePos = {
            x: currentCircle.x + Math.cos(angle) * (currentCircle.r + config.blueDot.orbitOffset),
            y: currentCircle.y + Math.sin(angle) * (currentCircle.r + config.blueDot.orbitOffset)
        };
        const directionX = mouseX - blueCirclePos.x;
        const directionY = mouseY - blueCirclePos.y;
        const length = Math.sqrt(directionX*directionX + directionY*directionY);

        // 计算切线方向（根据旋转方向）
        const tangentAngle = angle + (Math.PI/2) * rotationDirection; // 使用线条起点角度作为切线方向
        const directionScale = 8;
        velocity.x = Math.cos(tangentAngle) * directionScale;
        velocity.y = Math.sin(tangentAngle) * directionScale;
        
        // 记录完整线段端点
        // 生成完整弧线点集（删除未使用的arcPoints数组定义）
        position = {
            x: blueCirclePos.x,
            y: blueCirclePos.y,
            velocity: {
                x: Math.cos(tangentAngle) * directionScale,
                y: Math.sin(tangentAngle) * directionScale
            },
            
        };
        isFlying = true;
        trail = []; // 点击时清空拖尾
    });

    function draw() {
        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制所有白色圆形
        circles.forEach(circle => {
            ctx.beginPath();
            ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI*2);
            ctx.fillStyle = '#fff';
            ctx.fill();
        });

        // 使用当前选中的圆形
        const currentCircle = circles[currentCircleIndex];

        // 计算旋转线条位置（使用当前圆形参数）
        const lineStart = {
            x: currentCircle.x + Math.cos(angle) * (currentCircle.r + config.blueDot.orbitOffset),
            y: currentCircle.y + Math.sin(angle) * (currentCircle.r + config.blueDot.orbitOffset)
        };
        const lineEnd = {
            x: currentCircle.x + Math.cos(angle + Math.PI/2) * (currentCircle.r + config.blueDot.orbitOffset),
            y: currentCircle.y + Math.sin(angle + Math.PI/2) * (currentCircle.r + config.blueDot.orbitOffset)
        };

        // 绘制蓝色线条
        if (!isFlying) {
            const blueCirclePos = {
                x: currentCircle.x + Math.cos(angle) * (currentCircle.r + config.blueDot.orbitOffset),
                y: currentCircle.y + Math.sin(angle) * (currentCircle.r + config.blueDot.orbitOffset)
            };
            ctx.beginPath();
            ctx.arc(blueCirclePos.x, blueCirclePos.y, config.blueDot.radius, 0, Math.PI*2);
            ctx.fillStyle = '#00f';
            ctx.fill();
        }

        // 统一轨迹渲染
        trail.forEach((point, index) => {
            const alpha = (index + 1) / trailLength;
            ctx.beginPath();
            ctx.arc(point.x, point.y, config.blueDot.radius, 0, Math.PI*2);
            ctx.fillStyle = `rgba(0, 0, 255, ${alpha})`;
            ctx.fill();
        });

        // 更新角度
        if (isFlying) {
            // 更新飞行位置并记录轨迹
            position.x += velocity.x;
            position.y += velocity.y;
            
            // 添加轨迹效果
            trail.push({ x: position.x, y: position.y });
            if (trail.length > trailLength) {
                trail.shift();
            }

            // 绘制拖尾
            trail.forEach((point, index) => {
                const alpha = Math.pow((index + 1) / trailLength, 2);
                const radius = config.blueDot.radius * (1 - index/trailLength);
                ctx.beginPath();
                ctx.arc(point.x, point.y, radius, 0, Math.PI*2);
                ctx.fillStyle = `rgba(0, 0, 255, ${alpha})`;
                ctx.fill();
            });

            // 绘制主圆形
            ctx.beginPath();
            ctx.arc(position.x, position.y, config.blueDot.radius, 0, Math.PI*2);
            ctx.fillStyle = '#00f';
            ctx.fill();

            // 更新位置
            position.x += position.velocity.x;
            position.y += position.velocity.y;
            
            // 边界检测
            // 检测线段中点是否超出边界
            const midX = position.x;
            const midY = position.y;
            if ((midX < -100 || midX > canvas.width+100 || 
                midY < -100 || midY > canvas.height+100) && !victory) {
                gameOver = true;
            }
            
            // 碰撞检测
            circles.forEach((circle, index) => {
                if (index === currentCircleIndex) return;
                // 使用线段中点进行碰撞检测
                // 绘制蓝色圆形

                
                // 添加轨迹效果
                
                const dx = midX - circle.x;
                const dy = midY - circle.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < circle.r + 20) {  // 调整碰撞距离
                    const dy = position.y - circle.y;
                    const currentCircle = circles[currentCircleIndex];
                    const targetCircle = circles[index];
                    // 计算当前圆到目标圆的向量
                    const vectorX = targetCircle.x - currentCircle.x;
                    const vectorY = targetCircle.y - currentCircle.y;
                    // 计算蓝点位置相对于向量的叉积
                    const crossProduct = (midX - currentCircle.x) * vectorY - (midY - currentCircle.y) * vectorX;
                    rotationDirection = crossProduct > 0 ? 1 : -1;
                    currentCircleIndex = index;
                    isFlying = false;
                    position.x = circle.x;
                    position.y = circle.y;
                    
                    angle = 0;
                    trail = []; // 碰撞时清空拖尾
                }
                
                // 检测星星碰撞
                const starDx = midX - star.x;
                const starDy = midY - star.y;
                const starDistance = Math.sqrt(starDx*starDx + starDy*starDy);
                if (starDistance < config.star.safeDistance + star.size) {
                    victory = true;
                    isFlying = false;
                    trail = []; // 胜利时清空拖尾
                }
                
                // 检测挡板碰撞
                barriers.forEach(barrier => {
                    // 计算最近点
                    const closestX = Math.max(barrier.x, Math.min(position.x, barrier.x + barrier.width));
                    const closestY = Math.max(barrier.y, Math.min(position.y, barrier.y + barrier.height));
                    const dx = position.x - closestX;
                    const dy = position.y - closestY;
                    const distance = Math.sqrt(dx*dx + dy*dy);
                    
                    if (distance < barrier.collisionRadius) {
                        gameOver = true;
                        trail = []; // 游戏结束时清空拖尾
                    }
                });
            });
        } else {
            angle += config.game.rotationSpeed * rotationDirection;
            const blueCirclePos = {
                x: currentCircle.x + Math.cos(angle) * (currentCircle.r + config.blueDot.orbitOffset),
                y: currentCircle.y + Math.sin(angle) * (currentCircle.r + config.blueDot.orbitOffset)
            };
            position.x = blueCirclePos.x;
            position.y = blueCirclePos.y;
            trail.push({ x: position.x, y: position.y });
            if (trail.length > trailLength) trail.shift();
        }
        
        // 绘制红色挡板
        ctx.fillStyle = '#ff0000';
        barriers.forEach(barrier => {
            ctx.fillRect(barrier.x, barrier.y, barrier.width, barrier.height);
        });

        // 绘制黄色五角星
        ctx.beginPath();
        const spikes = star.spike;
        const outerRadius = star.size;
        const innerRadius = outerRadius/2;
        let rot = Math.PI/2*3;
        let x = star.x;
        let y = star.y;
        let step = Math.PI/spikes;

        for(let i=0; i<spikes; i++){
            // 外点
            ctx.lineTo(x + Math.cos(rot)*outerRadius, y + Math.sin(rot)*outerRadius);
            rot += step;
            // 内点
            ctx.lineTo(x + Math.cos(rot)*innerRadius, y + Math.sin(rot)*innerRadius);
            rot += step;
        }
        ctx.closePath();
        ctx.fillStyle = '#ff0';
        ctx.fill();

        if (victory) {
            document.getElementById('victoryModal').style.display = 'block';
            // 暂停游戏循环
            return;
        } else if (gameOver) {
            document.getElementById('gameOverModal').style.display = 'block';
            // 暂停游戏循环
            return;
        }
        requestAnimationFrame(draw);
    }

    // 启动动画
    draw();

    // 菜单按钮事件
    document.getElementById('menuBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        document.getElementById('menuModal').style.display = 'block';
    });

    // 重新开始游戏
    const restartGame = () => location.reload();
    const gotoLevelSelect = () => window.location.href = 'level-select.html';

    document.getElementById('restartBtn').addEventListener('click', restartGame);
    document.getElementById('gameOverRestartBtn').addEventListener('click', restartGame);
    document.getElementById('levelSelectBtn').addEventListener('click', gotoLevelSelect);
    document.getElementById('gameOverLevelSelectBtn').addEventListener('click', gotoLevelSelect);
    document.getElementById('victoryRestartBtn').addEventListener('click', restartGame);
    document.getElementById('victoryLevelSelectBtn').addEventListener('click', gotoLevelSelect);
    // 取消按钮点击事件
    document.getElementById('cancelBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        document.getElementById('menuModal').style.display = 'none';
    });

    // 点击外部关闭弹窗
    window.addEventListener('click', function(e) {
        if (e.target === document.getElementById('menuModal')) {
            e.stopPropagation();
            document.getElementById('menuModal').style.display = 'none';
        }
    });
});


// 添加关卡索引跟踪
let currentLevel = 0;
const levelFiles = ['level.js', 'level1.js', 'level2.js']; // 修正错误的文件后缀

// 下一关功能实现
document.getElementById('nextLevelBtn').addEventListener('click', () => {
    if(currentLevel >= levelFiles.length - 1) return;
currentLevel++;
    if(currentLevel >= levelFiles.length) {
        alert('已经是最后一关！');
        return;
    }
    
    // 动态加载下一关配置文件
    const script = document.createElement('script');
    script.src = `js/${levelFiles[currentLevel]}`;
    script.onload = () => {
        if(typeof initGame === 'function') {
            initGame();
            draw();
        } else {
            console.error('关卡初始化函数未定义');
        }
        document.getElementById('victoryModal').style.display = 'none';
    };
    script.onerror = () => {
        alert('关卡加载失败，请重试！');
        currentLevel--;
    };
    document.head.appendChild(script);
});
    