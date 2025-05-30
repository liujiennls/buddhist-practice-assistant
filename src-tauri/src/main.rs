// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use rand::prelude::*;

// Response structure for the wisdom command
#[derive(Serialize)]
struct WisdomResponse {
    message: String,
}

// Structure for the calculate command input
#[derive(Deserialize)]
struct CalculateArgs {
    operation: String,
    a: f64,
    b: f64,
}

// Buddhist wisdom patterns for responses
const WISDOM_PATTERNS: &[&str] = &[
    "佛陀教导我们，{concept}。当您面对{problem}时，请记住{solution}。",
    "在佛学哲理中，我们理解{concept}。您所面临的{problem}正是这一教义的体现。请思考{solution}。",
    "佛法告诉我们，{concept}。您所经历的{problem}是暂时的。请在{solution}中找到平静。",
    "根据佛教智慧，{concept}。您的{problem}源于执着。通过{solution}来获得解脱。",
    "无常的教义提醒我们，{concept}。您的{problem}并非永恒。尝试{solution}。",
    "慈悲是佛教的核心。面对{problem}时，请记住{concept}。您可以通过{solution}找到缓解。",
    "中道教导我们避免极端。关于您的{problem}，请思考{concept}。或许您可以{solution}。",
    "佛教修行鼓励正念。关于您的{problem}，试着观察{concept}。这种觉知可能帮助您{solution}。",
    "四圣谛教导我们关于苦及其止息。您的{problem}是一种源于{concept}的苦。您可以通过{solution}找到自由。",
    "在禅修中，我们学习{concept}。将此应用于您的{problem}，通过{solution}。"
];

// Buddhist concepts for wisdom responses
const BUDDHIST_CONCEPTS: &[&str] = &[
    "万事万物都是无常的，不断变化的",
    "执着是痛苦的根源",
    "对一切众生的慈悲会带来内心的平静",
    "正念帮助我们如实地看待事物",
    "中道避免了放纵与自我否定的极端",
    "我们的思想创造了我们的现实",
    "苦来源于渴望和厌恶",
    "我们与所有生命相互连接",
    "平静来自内心，而非外部环境",
    "放下期望使我们从失望中解脱",
    "每一个行为都有自然而然的后果",
    "智慧源于清晰的观察和理解",
    "不执着使我们能够享受而不依恋",
    "平等心帮助我们面对快乐和痛苦",
    "慈爱消解仇恨和怨恨"
];

// Buddhist solutions for wisdom responses
const BUDDHIST_SOLUTIONS: &[&str] = &[
    "修习正念禅修，不带评判地观察您的想法",
    "培养对自己和他人的慈悲",
    "记住所有情况和情绪的无常本质",
    "放下对特定结果的执着",
    "在您的方法中找到极端之间的中道",
    "对当下所拥有的心怀感恩",
    "以温和的觉知观察您的反应",
    "向自己和挑战您的人散发慈爱",
    "寻求简单和对现状的满足",
    "记住所有众生都希望快乐并远离痛苦",
    "注意情绪的生起和消失，而不执着于它们",
    "接受无法改变的事物",
    "在愉快和不愉快的体验中培养平等心",
    "反思万物的相互依存",
    "在处理情况时找到努力和放松之间的平衡"
];

// Command that returns Buddhist wisdom
#[tauri::command]
fn wisdom(question: &str) -> WisdomResponse {
    let mut rng = rand::thread_rng();
    
    // Extract key problem from the question (use full question if it's short)
    let problem = if question.len() > 30 {
        &question[0..30]
    } else {
        question
    };
    
    // Randomly select pattern, concept, and solution
    let pattern = WISDOM_PATTERNS.choose(&mut rng).unwrap_or(&WISDOM_PATTERNS[0]);
    let concept = BUDDHIST_CONCEPTS.choose(&mut rng).unwrap_or(&BUDDHIST_CONCEPTS[0]);
    let solution = BUDDHIST_SOLUTIONS.choose(&mut rng).unwrap_or(&BUDDHIST_SOLUTIONS[0]);
    
    // Create response by filling in the pattern
    let message = pattern
        .replace("{concept}", concept)
        .replace("{problem}", problem)
        .replace("{solution}", solution);
    
    WisdomResponse { message }
}

// Command that performs a basic calculation
#[tauri::command]
fn calculate(args: CalculateArgs) -> Result<f64, String> {
    match args.operation.as_str() {
        "add" => Ok(args.a + args.b),
        "subtract" => Ok(args.a - args.b),
        "multiply" => Ok(args.a * args.b),
        "divide" => {
            if args.b == 0.0 {
                Err("不能除以零".to_string())
            } else {
                Ok(args.a / args.b)
            }
        }
        _ => Err(format!("未知操作: {}", args.operation)),
    }
}

// Command to get system information
#[tauri::command]
fn get_system_info() -> serde_json::Value {
    serde_json::json!({
        "os": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
        "cpu_count": num_cpus::get(),
        "app_version": env!("CARGO_PKG_VERSION"),
    })
}

// Command to get a random daily quote
#[tauri::command]
fn get_daily_quote() -> serde_json::Value {
    let quotes = [
        ("和平来自内心，不要向外寻求。", "佛陀"),
        ("心即是一切。你所想即你所成。", "佛陀"),
        ("三件事物无法长久隐藏：太阳，月亮和真相。", "佛陀"),
        ("没有人能救我们，只有我们自己。没有人能够，也没有人可以。我们必须自己走这条路。", "佛陀"),
        ("执着于愤怒，就像喝毒药而期望他人死亡。", "佛陀"),
        ("你不会因为愤怒而受到惩罚，你会被你的愤怒惩罚。", "佛陀"),
        ("苦的根源是执着。", "佛陀"),
        ("健康是最大的礼物，满足是最大的财富，忠诚是最好的关系。", "佛陀"),
        ("征服自己比赢得千场战斗更好。", "佛陀"),
        ("怀疑一切。找到你自己的光。", "佛陀"),
        ("每天早晨我们重生。今天我们做的事情最重要。", "佛陀"),
        ("通往幸福没有道路：幸福就是道路。", "佛陀"),
        ("问题是，你以为你有时间。", "佛陀"),
        ("你的工作是发现你的世界，然后全心全意地投入。", "佛陀"),
        ("如果你真正爱自己，你就永远不会伤害他人。", "佛陀"),
        ("道不在天上，道在心中。", "佛陀"),
        ("你只会失去你所执着的。", "佛陀"),
        ("水壶一滴一滴地装满。", "佛陀"),
        ("没有什么能像你不受保护的思想那样伤害你。", "佛陀"),
        ("如果你的慈悲不包括自己，那就是不完整的。", "佛陀")
    ];
    
    let mut rng = rand::thread_rng();
    let (text, author) = quotes.choose(&mut rng).unwrap_or(&quotes[0]);
    
    serde_json::json!({
        "text": text,
        "author": author
    })
}

// Command to log meditation session
#[tauri::command]
fn log_meditation(duration_minutes: u32) -> serde_json::Value {
    // In a real app, this would save to a database
    serde_json::json!({
        "success": true,
        "message": format!("成功记录了{}分钟的禅修。愿您内心平静。", duration_minutes),
        "timestamp": chrono::Local::now().to_rfc3339()
    })
}

fn main() {
    tauri::Builder::default()
        // Register the commands
        .invoke_handler(tauri::generate_handler![
            wisdom,
            calculate,
            get_system_info,
            get_daily_quote,
            log_meditation
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
