// Настройка «холста»
var canvas = document.getElementById("canvas");

var event = new Event("boom");

canvas.addEventListener("boom", function(e) {

    $(document).ready(function() {
        $("#canvas").toggleClass("boom");
    });

})

var ctx = canvas.getContext("2d");
// Получаем ширину и высоту элемента canvas
var width = canvas.width;
var height = canvas.height;
// Вычисляем ширину и высоту в ячейках
var blockSize = 10;
var widthInBlocks = width / blockSize;
var heightInBlocks = height / blockSize;
// Устанавливаем счет 0
var score = 0;
var score_html = document.getElementById("score");

var apple_timer = 0;

// Рисуем рамку
var drawBorder = function(r, g, b) {
    ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
    ctx.fillRect(0, 0, width, blockSize);
    ctx.fillRect(0, height - blockSize, width, blockSize);
    ctx.fillRect(0, 0, blockSize, height);
    ctx.fillRect(width - blockSize, 0, blockSize, height);
};

// Выводим счет игры в левом верхнем углу
var drawScore = function() {
    score_html.innerHTML = "Score " + score;
};

var is_snek_ded = true;

// Отменяем действие setInterval и печатаем сообщение «Конец игры»
var gameOver = function() {

    clearTimeout(callback);

    is_snek_ded = false;
    var audio = new Audio('sfx/sfx_exp_double1.wav');
    audio.play();
    canvas.dispatchEvent(event);

};
// Рисуем окружность (используя функцию из главы 14)
var circle = function(x, y, radius, fillCircle) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    if (fillCircle) {
        ctx.fill();
    } else {
        ctx.stroke();
    }
};
// Задаем конструктор Block (ячейка)
var Block = function(col, row) {
    this.col = col;
    this.row = row;
};
// Рисуем квадрат в позиции ячейки
Block.prototype.drawSquare = function(color) {
    var x = this.col * blockSize;
    var y = this.row * blockSize;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, blockSize, blockSize);
};
// Рисуем круг в позиции ячейки
Block.prototype.drawCircle = function(color) {
    var centerX = this.col * blockSize + blockSize / 2;
    var centerY = this.row * blockSize + blockSize / 2;
    ctx.fillStyle = color;
    circle(centerX, centerY, blockSize / 2, true);
};
// Проверяем, находится ли эта ячейка в той же позиции, что и ячейка
// otherBlock
Block.prototype.equal = function(otherBlock) {
    return this.col === otherBlock.col && this.row === otherBlock.row;
};
// Задаем конструктор Snake (змейка)
var Snake = function() {
    this.segments = [
        new Block(7, 5),
        new Block(6, 5),
        new Block(5, 5)
    ];
    this.direction = "right";
    this.nextDirection = "right";
};
// Рисуем квадратик для каждого сегмента тела змейки
Snake.prototype.draw = function() {
    for (var i = 0; i < this.segments.length; i++) {
        this.segments[i].drawSquare("#0F5F32");
    }
};
// Создаем новую голову и добавляем ее к началу змейки,
// чтобы передвинуть змейку в текущем направлении
Snake.prototype.move = function() {

    var head = this.segments[0];
    var newHead;
    this.direction = this.nextDirection;
    if (this.direction === "right") {
        newHead = new Block(head.col + 1, head.row);
    } else if (this.direction === "down") {
        newHead = new Block(head.col, head.row + 1);
    } else if (this.direction === "left") {
        newHead = new Block(head.col - 1, head.row);
    } else if (this.direction === "up") {
        newHead = new Block(head.col, head.row - 1);
    }
    if (this.checkCollision(newHead)) {
        gameOver();
        return;
    }

    this.segments.unshift(newHead);
    if (newHead.equal(apple.position)) {
        score++;

        apple_timer = 0;
        if (interval >= 62) {
            interval -= 4;
        }

        if (interval <= 62) {
            interval -= 2;
        }

        apple.move();

        if (score % 10 === 0) {
            var audio = new Audio('sfx/sfx_coin_double2.wav');
        } else {

            var audio = new Audio('sfx/sfx_coin_double3.wav');
        }
        audio.play();
    }

     else {
        this.segments.pop();
    }
};
// Проверяем, не столкнулась ли змейка со стеной или собственным
// телом
Snake.prototype.checkCollision = function(head) {
    var leftCollision = (head.col === 0);
    var topCollision = (head.row === 0);
    var rightCollision = (head.col === widthInBlocks - 1);
    var bottomCollision = (head.row === heightInBlocks - 1);
    var wallCollision = leftCollision || topCollision ||
        rightCollision || bottomCollision;
    var selfCollision = false;

    for (var i = 0; i < this.segments.length; i++) {
        if (head.equal(this.segments[i])) {
            selfCollision = true;
        }
    }
    return wallCollision || selfCollision;
};
// Задаем следующее направление движения змейки на основе нажатой
// клавиши
Snake.prototype.setDirection = function(newDirection) {
    if (this.direction === "up" && newDirection === "down") {
        return;
    } else if (this.direction === "right" && newDirection === "left") {
        return;
    } else if (this.direction === "down" && newDirection === "up") {
        return;
    } else if (this.direction === "left" && newDirection === "right") {
        return;
    }
    this.nextDirection = newDirection;
};
// Задаем конструктор Apple (яблоко)
var Apple = function() {
    this.position = new Block(10, 10);
};

// Рисуем кружок в позиции яблока
Apple.prototype.draw = function(color) {
    this.position.drawCircle(color);
};
// Перемещаем яблоко в случайную позицию
Apple.prototype.move = function() {
    var randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
    var randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;

    if (randomCol === 1) {
        randomCol++;
    }

    if (randomCol === 38) {
        randomCol--;
    }

    if (randomRow === 38) {
        randomRow--;
    }

    if (randomRow === 1) {
        randomRow++;
    }


    this.position = new Block(randomCol, randomRow);
};

// Создаем объект-змейку и объект-яблоко
var snake = new Snake();
var apple = new Apple();
// Запускаем функцию анимации через setInterval

var interval = 120;
var r = Math.floor(Math.random() * (255 - 0) + 0);
var g = Math.floor(Math.random() * (255 - 0) + 0);
var b = Math.floor(Math.random() * (255 - 0) + 0);

var c_r = r;
var c_g = g;
var c_b = b;

var go_up = false;

var displace = 1;

function callback() {

    if (is_snek_ded) {
        ctx.clearRect(0, 0, width, height);
        drawScore();
        snake.move();
        snake.draw();

        if (score <= 22) {

            if (apple_timer < 30) {
                apple.draw("#801515");
            }
            if (apple_timer > 30) {
                if (apple_timer % 10 === 0 || apple_timer % 10 === 5) {
                    apple.draw("#ffffff");
                    var audio = new Audio('sfx/sfx_movement_footsteps1b.wav')
                    audio.play();
                } else {
                    apple.draw("#801515");
                }
            }

        }

        if (score > 22) {

            if (apple_timer < 70) {
                apple.draw("#801515");
            }
            if (apple_timer > 70) {
                if (apple_timer % 10 === 0 || apple_timer % 10 === 5) {
                    apple.draw("#ffffff");
                    var audio = new Audio('sfx/sfx_movement_footsteps1b.wav')
                    audio.play();
                } else {
                    apple.draw("#801515");
                }
            }

        }
        drawBorder(c_r, c_g, c_b);
        apple_timer++;
        console.log(apple_timer);

        if (score <= 22) {
            if (apple_timer >= 50) {
                apple.move();
                var audio = new Audio('sfx/sfx_movement_jump8.wav')
                audio.play();
                apple_timer = 0;
            }

        }

        if (score > 22) {
            if (apple_timer >= 100) {
                apple.move();
                var audio = new Audio('sfx/sfx_movement_jump8.wav')
                audio.play();
                apple_timer = 0;
            }

        }
        if (c_r >= r) {
            if (c_g >= g) {
                if (c_b >= b) {
                    go_up = false;
                }
            }
        }

        if (c_r <= 0) {
            if (c_g <= 0) {
                if (c_b <= 0) {
                    go_up = true;
                }
            }
        }

        if (go_up === true) {
            c_r += 5;
            c_g += 5;
            c_b += 5;
        } else {
            c_r -= 5;
            c_g -= 5;
            c_b -= 5;
        }

    }

    if (is_snek_ded === false) {

        var r1 = Math.floor(Math.random() * (255 - 0) + 0);
        var r2 = Math.floor(Math.random() * (255 - 0) + 0);
        var r3 = Math.floor(Math.random() * (255 - 0) + 0);

        interval = 10;

        ctx.font = "40px Arial";
        ctx.fillStyle = "rgb(" + r1 + "," + r2 + "," + r3 + ")";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("GAME", width / 2 + displace, height / 2 - displace);

        ctx.fillText("OVER", width / 2 - displace, height / 2 + displace);


        displace++;
    }
    timer = setTimeout(callback, interval);
}

timer = setTimeout(callback, interval);

// Преобразуем коды клавиш в направления
var directions = {
    37: "left",
    38: "up",
    39: "right",
    40: "down"
};
// Задаем обработчик события keydown (клавиши-стрелки)
$("body").keydown(function(event) {
    var newDirection = directions[event.keyCode];
    if (newDirection !== undefined) {
        snake.setDirection(newDirection);
    }
});