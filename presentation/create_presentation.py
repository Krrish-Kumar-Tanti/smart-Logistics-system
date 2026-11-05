from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
blank_layout = prs.slide_layouts[6]

# Brand Colors
C_DARK_BG   = RGBColor(7, 11, 18)       # #070B12
C_CARD_DARK = RGBColor(15, 23, 42)      # #0F172A
C_LIGHT_BG  = RGBColor(248, 250, 252)   # #F8FAFC
C_CARD_BG   = RGBColor(255, 255, 255)   # #FFFFFF
C_GOLD      = RGBColor(197, 160, 89)    # #C5A059
C_GOLD_DARK = RGBColor(140, 109, 45)    # #8C6D2D
C_TEXT_DARK = RGBColor(15, 23, 42)      # #0F172A
C_TEXT_MUTED= RGBColor(100, 116, 139)   # #64748B
C_BORDER    = RGBColor(226, 232, 240)   # #E2E8F0
C_GREEN     = RGBColor(16, 185, 129)    # #10B981
C_AMBER     = RGBColor(245, 158, 11)    # #F59E0B
C_RED       = RGBColor(239, 68, 68)     # #EF4444

def set_slide_background(slide, color):
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = color

def add_header(slide, title_text, pill_text, counter_text, dark_mode=False):
    # Top Gold Accent Line
    top_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.08))
    top_bar.fill.solid()
    top_bar.fill.fore_color.rgb = C_GOLD
    top_bar.line.fill.background()

    # Pill
    pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.35), Inches(4.5), Inches(0.32))
    pill.fill.solid()
    pill.fill.fore_color.rgb = RGBColor(22, 33, 52) if dark_mode else RGBColor(245, 239, 225)
    pill.line.color.rgb = C_GOLD
    pill.line.width = Pt(1)
    tf_p = pill.text_frame
    tf_p.word_wrap = True
    p = tf_p.paragraphs[0]
    p.text = pill_text.upper()
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = C_GOLD if dark_mode else C_GOLD_DARK
    p.alignment = PP_ALIGN.CENTER

    # Counter Box
    cb = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(10.5), Inches(0.35), Inches(2.0), Inches(0.32))
    cb.fill.solid()
    cb.fill.fore_color.rgb = RGBColor(22, 33, 52) if dark_mode else C_CARD_BG
    cb.line.color.rgb = C_BORDER
    tf_c = cb.text_frame
    p_c = tf_c.paragraphs[0]
    p_c.text = counter_text.upper()
    p_c.font.size = Pt(9)
    p_c.font.bold = True
    p_c.font.color.rgb = C_GOLD if dark_mode else C_GOLD_DARK
    p_c.alignment = PP_ALIGN.CENTER

    # Title
    t_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.7), Inches(0.6))
    tf_t = t_box.text_frame
    tf_t.word_wrap = True
    p_t = tf_t.paragraphs[0]
    p_t.text = title_text
    p_t.font.size = Pt(20)
    p_t.font.bold = True
    p_t.font.color.rgb = RGBColor(255, 255, 255) if dark_mode else C_TEXT_DARK

# ==========================================
# SLIDE 1: COVER
# ==========================================
s1 = prs.slides.add_slide(blank_layout)
set_slide_background(s1, C_DARK_BG)

top_bar1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.08))
top_bar1.fill.solid()
top_bar1.fill.fore_color.rgb = C_GOLD
top_bar1.line.fill.background()

# Title text box
tb = s1.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(11.7), Inches(3.2))
tf = tb.text_frame
tf.word_wrap = True

p1 = tf.paragraphs[0]
p1.text = "L'ORÉAL SUSTAINABILITY CHALLENGE 2026 • SALES & COMMERCIAL TRACK"
p1.font.size = Pt(11)
p1.font.bold = True
p1.font.color.rgb = C_GOLD

p2 = tf.add_paragraph()
p2.text = "L’ORÉAL VeloCity AI"
p2.font.size = Pt(40)
p2.font.bold = True
p2.font.color.rgb = RGBColor(255, 255, 255)

p3 = tf.add_paragraph()
p3.text = "Selling Smarter: Building an Autonomous, Zero-Waste Sales Engine"
p3.font.size = Pt(18)
p3.font.bold = True
p3.font.color.rgb = RGBColor(243, 229, 200)

p4 = tf.add_paragraph()
p4.text = (
    "\nA mobile-first edge AI platform empowering On-Ground Sales Teams to eliminate the 2.5% revenue bleed\n"
    "caused by expired, damaged, and stagnant beauty stock through real-time CV shelf audits, predictive\n"
    "decay telemetry, and hyper-local B2B circular redistribution before products become landfill waste."
)
p4.font.size = Pt(12)
p4.font.color.rgb = RGBColor(203, 213, 225)

# Middle Architecture Banner
arch_bar = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.0), Inches(11.7), Inches(0.9))
arch_bar.fill.solid()
arch_bar.fill.fore_color.rgb = RGBColor(22, 33, 52)
arch_bar.line.color.rgb = C_GOLD
tf_a = arch_bar.text_frame
tf_a.word_wrap = True
pa = tf_a.paragraphs[0]
pa.text = "ON-GROUND TELEMETRY (3-Sec CV & Batch OCR)   ➔   PREDICTIVE TRI-BAND (Green / Amber / Red)   ➔   CIRCULAR OFFTAKE (3 km StockSwap)"
pa.font.size = Pt(11)
pa.font.bold = True
pa.font.color.rgb = RGBColor(255, 255, 255)
pa.alignment = PP_ALIGN.CENTER

# 3 Pillars
pillars = [
    ("PILLAR 01: EDGE-CV EARLY DETECTION", "3-second panoramic camera audit and OCR batch harvesting detecting shelf dust, pack discoloration, and planogram displacement directly on the rep's smartphone."),
    ("PILLAR 02: AUTONOMOUS TRI-BAND TRIAGE", "Continuous telemetry synthesizing distributor velocity & store footfall to classify inventory into Green (Velocity), Amber (Stagnant >60d), and Red (Critical <90d)."),
    ("PILLAR 03: HYPERLOCAL B2B REDISTRIBUTION", "Algorithmic lateral 'StockSwap' between nearby salons & chemists within 3 km, eliminating reverse logistics, write-offs, and destruction overhead.")
]

for i, (p_t, p_d) in enumerate(pillars):
    x = Inches(0.8 + i * 4.0)
    card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(5.1), Inches(3.7), Inches(1.8))
    card.fill.solid()
    card.fill.fore_color.rgb = RGBColor(19, 30, 49)
    card.line.color.rgb = RGBColor(51, 65, 85)
    tfc = card.text_frame
    tfc.word_wrap = True
    pt = tfc.paragraphs[0]
    pt.text = p_t
    pt.font.size = Pt(10)
    pt.font.bold = True
    pt.font.color.rgb = C_GOLD
    pd = tfc.add_paragraph()
    pd.text = f"\n{p_d}"
    pd.font.size = Pt(9.5)
    pd.font.color.rgb = RGBColor(226, 232, 240)

# ==========================================
# SLIDE 2: CONTEXT & PROBLEM FRAMING
# ==========================================
s2 = prs.slides.add_slide(blank_layout)
set_slide_background(s2, C_LIGHT_BG)
add_header(s2, "The 2.5% Blindspot: Why Traditional FMCG Sales Bleed Margin & Carbon", "Slide 1 of 3: Context & Problem Framing", "Problem & Strategy")

# Left Card: Revenue Drain
c2_left = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.5), Inches(5.6), Inches(5.4))
c2_left.fill.solid()
c2_left.fill.fore_color.rgb = C_CARD_BG
c2_left.line.color.rgb = C_BORDER
tf2l = c2_left.text_frame
tf2l.word_wrap = True
p = tf2l.paragraphs[0]
p.text = "THE ANATOMY OF REVENUE LEAKAGE (~2.5% TOP-LINE DRAIN)"
p.font.size = Pt(11)
p.font.bold = True
p.font.color.rgb = C_GOLD_DARK

p_sub = tf2l.add_paragraph()
p_sub.text = (
    "\n• Net Delivered Revenue: 97.5% of total sales\n"
    "• Direct Write-Offs: ~1.5% (Expired, damaged & returned stock)\n"
    "• Reverse Logistics Overhead: ~1.0% (Freight, sorting & incineration)\n\n"
    "THE MACRO CHALLENGE:\n"
    "For a ₹2,000 Cr beauty business, 2.5% leakage equals ₹50 Cr in annual EBITDA loss.\n"
    "Unsold stock burns millions in reverse freight and produces 120+ MT of plastic scrap landfilled annually."
)
p_sub.font.size = Pt(10)
p_sub.font.color.rgb = C_TEXT_DARK

# 3 Stat KPI Boxes inside Left Card
kpis = [("₹42 Cr+", "Annual Bleed", C_RED), ("120 MT", "Plastic Scrap", C_TEXT_DARK), ("3.2x", "Reverse Freight Cost", C_GREEN)]
for i, (val, lbl, col) in enumerate(kpis):
    x = Inches(1.0 + i * 1.75)
    box = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(5.4), Inches(1.65), Inches(1.2))
    box.fill.solid()
    box.fill.fore_color.rgb = RGBColor(248, 250, 252)
    box.line.color.rgb = C_BORDER
    tfk = box.text_frame
    tfk.word_wrap = True
    pv = tfk.paragraphs[0]
    pv.alignment = PP_ALIGN.CENTER
    pv.text = val
    pv.font.size = Pt(15)
    pv.font.bold = True
    pv.font.color.rgb = col
    pl = tfk.add_paragraph()
    pl.alignment = PP_ALIGN.CENTER
    pl.text = lbl
    pl.font.size = Pt(8.5)
    pl.font.bold = True
    pl.font.color.rgb = C_TEXT_MUTED

# Right Card: Transformation Matrix Table
c2_right = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.7), Inches(1.5), Inches(5.8), Inches(5.4))
c2_right.fill.solid()
c2_right.fill.fore_color.rgb = C_CARD_BG
c2_right.line.color.rgb = C_BORDER
tf2r = c2_right.text_frame
tf2r.word_wrap = True
p = tf2r.paragraphs[0]
p.text = "ROOT CAUSE ANALYSIS & TRANSFORMATION MATRIX"
p.font.size = Pt(11)
p.font.bold = True
p.font.color.rgb = C_GOLD_DARK

matrix_rows = [
    ("1. Incentive Misalignment", "Legacy: 100% quota on primary order booking. Zero penalty for decay.\nVeloCity: Net Freshness Index (NFI) links 20% commission to stock velocity."),
    ("2. Store-Level Visibility", "Legacy: Blind order entry. No detection of dusty cartons or back-room aging.\nVeloCity: 3-Sec CV Edge Audit detects batch dates & shelf dust levels."),
    ("3. Inventory Stagnation", "Legacy: Slow SKUs rot on shelf. Reaction is order slashing, causing stockouts.\nVeloCity: Dynamic B2B Bundling creates high-margin combos to move Amber stock."),
    ("4. Near-Expiry Disposal", "Legacy: Shipped back via reverse logistics to central hubs for incineration.\nVeloCity: Lateral StockSwap automatically re-routes to nearby salons within 3 km.")
]

for title, desc in matrix_rows:
    p1 = tf2r.add_paragraph()
    p1.text = f"\n• {title}"
    p1.font.size = Pt(10)
    p1.font.bold = True
    p1.font.color.rgb = C_TEXT_DARK
    p2 = tf2r.add_paragraph()
    p2.text = desc
    p2.font.size = Pt(9)
    p2.font.color.rgb = C_TEXT_MUTED

# ==========================================
# SLIDE 3: TECH ARCHITECTURE & FIGMA PLACEHOLDER
# ==========================================
s3 = prs.slides.add_slide(blank_layout)
set_slide_background(s3, C_LIGHT_BG)
add_header(s3, "L’Oréal VeloCity AI: 3-Second Edge-CV Shelf Audit & Triage Engine", "Slide 2 of 3: Technology Architecture & Detection", "AI & Edge Architecture")

# Left Column: Process Steps & Tri-Band Table
c3_left = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.5), Inches(6.8), Inches(5.4))
c3_left.fill.solid()
c3_left.fill.fore_color.rgb = C_CARD_BG
c3_left.line.color.rgb = C_BORDER
tf3l = c3_left.text_frame
tf3l.word_wrap = True

p = tf3l.paragraphs[0]
p.text = "EDGE-AI DETECTION & TRIAGE PIPELINE (OFFLINE-CAPABLE)"
p.font.size = Pt(11)
p.font.bold = True
p.font.color.rgb = C_GOLD_DARK

steps = [
    ("Step 1: 3-Second Panoramic Edge-CV Scan", "FSO takes a single panoramic shelf photo. A quantized on-device model (YOLOv8-nano) detects physical aging markers: dust layer density, UV color fading, carton corner scuffs, and planogram displacement."),
    ("Step 2: OCR Batch & Expiry Harvester", "Integrated computer vision OCR extracts batch numbers and manufacturing stamps directly from secondary cartons or shelf tags, calculating Days-of-Inventory (DOI) with zero manual data entry."),
    ("Step 3: Autonomous Tri-Band Triage Protocol", "Combines store-level offtake velocity with regional DMS secondary billing to immediately classify inventory into 3 distinct operational risk bands:")
]

for st, sd in steps:
    p1 = tf3l.add_paragraph()
    p1.text = f"\n• {st}"
    p1.font.size = Pt(10)
    p1.font.bold = True
    p1.font.color.rgb = C_TEXT_DARK
    p2 = tf3l.add_paragraph()
    p2.text = sd
    p2.font.size = Pt(9)
    p2.font.color.rgb = C_TEXT_MUTED

# 3 Tri-Band Rows inside Left Column
triband = [
    ("🟢 Green Band (Fast Velocity)", "Standard Replenishment Order Cycle", "> 180 Days Life", RGBColor(236, 253, 245), C_GREEN),
    ("🟡 Amber Band (Slow-Moving)", "Trigger Planogram Re-anchoring & B2B Bundles", "60–180 Days Stagnant", RGBColor(255, 251, 235), C_AMBER),
    ("🔴 Red Band (Near-Expiry)", "Initiate Hyperlocal StockSwap / Salon Liquidation", "< 90 Days to Expiry", RGBColor(254, 242, 242), C_RED)
]

for i, (b_name, b_act, b_days, bg_col, border_col) in enumerate(triband):
    y = Inches(5.1 + i * 0.55)
    row = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), y, Inches(6.4), Inches(0.48))
    row.fill.solid()
    row.fill.fore_color.rgb = bg_col
    row.line.color.rgb = border_col
    row.line.width = Pt(1.5)
    tfr = row.text_frame
    tfr.word_wrap = True
    pr = tfr.paragraphs[0]
    pr.text = f"{b_name}  |  {b_act}  [{b_days}]"
    pr.font.size = Pt(8.5)
    pr.font.bold = True
    pr.font.color.rgb = C_TEXT_DARK

# Right Column: Figma Phone Mockup Frame
p_frame = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.9), Inches(1.5), Inches(4.6), Inches(5.4))
p_frame.fill.solid()
p_frame.fill.fore_color.rgb = RGBColor(15, 23, 42)
p_frame.line.color.rgb = C_GOLD
p_frame.line.width = Pt(2)
tf_pf = p_frame.text_frame
tf_pf.word_wrap = True

pp1 = tf_pf.paragraphs[0]
pp1.alignment = PP_ALIGN.CENTER
pp1.text = "\n📱 FIELD SALES OFFICER MOBILE VIEW\n"
pp1.font.size = Pt(11)
pp1.font.bold = True
pp1.font.color.rgb = C_GOLD

pp2 = tf_pf.add_paragraph()
pp2.alignment = PP_ALIGN.CENTER
pp2.text = (
    "[ SIMULATED LIVE CAMERA VIEW ]\n"
    "• Maybelline Kajal: GREEN (8d DOI)\n"
    "• Garnier Micellar: AMBER (92d DOI)\n"
    "• L'Oréal Serum #B2: RED (<60d EXP)\n\n"
    "-----------------------------------------\n"
    "FIGMA APP UI: CAMERA AUDIT & BATCH OCR\n\n"
    "[ DRAG & DROP YOUR EXPORTED FIGMA MOBILE UI SCREENSHOT HERE ]\n\n"
    "-----------------------------------------\n"
)
pp2.font.size = Pt(9.5)
pp2.font.color.rgb = RGBColor(226, 232, 240)

# ==========================================
# SLIDE 4: ON-GROUND INTERVENTIONS & IMPACT
# ==========================================
s4 = prs.slides.add_slide(blank_layout)
set_slide_background(s4, C_LIGHT_BG)
add_header(s4, "Actionable Interventions, Dynamic Liquidation & Business Impact", "Slide 3 of 3: On-Ground Execution & Impact", "Operations & ESG ROI")

# Left Column: Amber & Red Playbooks
c4_left = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.5), Inches(5.8), Inches(4.3))
c4_left.fill.solid()
c4_left.fill.fore_color.rgb = C_CARD_BG
c4_left.line.color.rgb = C_BORDER
tf4l = c4_left.text_frame
tf4l.word_wrap = True

p = tf4l.paragraphs[0]
p.text = "DIFFERENTIATED ON-GROUND INTERVENTION PLAYBOOK"
p.font.size = Pt(11)
p.font.bold = True
p.font.color.rgb = C_GOLD_DARK

p_amb = tf4l.add_paragraph()
p_amb.text = (
    "\n🟡 AMBER PLAYBOOK: SLOW-MOVING SKUs (>60d Stagnant)\n"
    "• Planogram Re-anchoring: AI directs FSO to reposition slow shade next to Hero SKU at eye level.\n"
    "• Dynamic B2B Bundling: SFA unlocks high-margin bundles ('Buy 6 Kajals + 2 Amber Lipsticks at +6% margin').\n"
    "• Tester Unit Conversion: 1-tap in-app manager authorization to convert 1 stagnant sealed SKU into consumer tester."
)
p_amb.font.size = Pt(9.5)
p_amb.font.color.rgb = C_TEXT_DARK

p_red = tf4l.add_paragraph()
p_red.text = (
    "\n🔴 RED PLAYBOOK: CRITICAL EXPIRY (<90 Days to Expiry)\n"
    "• Hyperlocal Lateral 'StockSwap': Algorithmic matching with nearby salons or MT doors within 3 km.\n"
    "• Salon Back-Bar Bulk Consumption: Transfer premium hair serums directly for back-bar service use (consumed in 7-14d).\n"
    "• Quick-Commerce Flash Push: Automatic API integration with Blinkit/Zepto dark stores for 48h flash discounts."
)
p_red.font.size = Pt(9.5)
p_red.font.color.rgb = C_TEXT_DARK

# Right Column: OpenCode Example Mockup Frame
oc_frame = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.9), Inches(1.5), Inches(5.6), Inches(4.3))
oc_frame.fill.solid()
oc_frame.fill.fore_color.rgb = RGBColor(15, 23, 42)
oc_frame.line.color.rgb = C_GOLD
oc_frame.line.width = Pt(2)
tf_oc = oc_frame.text_frame
tf_oc.word_wrap = True

po1 = tf_oc.paragraphs[0]
po1.alignment = PP_ALIGN.CENTER
po1.text = "\n⚡ OPENCODE EXAMPLE / ACTION CARD UI\n"
po1.font.size = Pt(11)
po1.font.bold = True
po1.font.color.rgb = C_GOLD

po2 = tf_oc.add_paragraph()
po2.alignment = PP_ALIGN.CENTER
po2.text = (
    "[ SIMULATED ACTION CARD MODAL ]\n"
    "⚡ LATERAL STOCKSWAP SUGGESTED (98% MATCH)\n"
    "Looks Salon (1.4 km away) has high velocity for 12 units of Hair Serum #B2.\n"
    "[✓ Execute 1-Tap Transfer & Credit Note]\n\n"
    "-----------------------------------------\n"
    "OPENCODE / FIGMA IMPLEMENTATION:\n\n"
    "[ DRAG & DROP YOUR OPENCODE / FIGMA EXAMPLE SCREEN HERE ]\n\n"
    "-----------------------------------------\n"
)
po2.font.size = Pt(9.5)
po2.font.color.rgb = RGBColor(226, 232, 240)

# Bottom Full-Width Impact Strip
strip = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.0), Inches(11.7), Inches(0.95))
strip.fill.solid()
strip.fill.fore_color.rgb = RGBColor(15, 23, 42)
strip.line.color.rgb = C_GOLD
tf_s = strip.text_frame
tf_s.word_wrap = True
ps = tf_s.paragraphs[0]
ps.text = "60% CUT IN REVERSE LOGISTICS   |   ₹42 CR+ ANNUAL PROTECTED EBITDA   |   120 MT PLASTIC DIVERTED   |   NET FRESHNESS INDEX BONUS"
ps.font.size = Pt(10)
ps.font.bold = True
ps.font.color.rgb = RGBColor(243, 229, 200)
ps.alignment = PP_ALIGN.CENTER

# ==========================================
# SLIDE 5: ROADMAP & TEAM
# ==========================================
s5 = prs.slides.add_slide(blank_layout)
set_slide_background(s5, C_DARK_BG)
add_header(s5, "Scalable Execution: 90-Day Pilot, EPR Governance & Team", "Governance & Execution Roadmap", "Rollout Plan", dark_mode=True)

# 3 Milestone Cards
phases = [
    ("PHASE 1: DAYS 1–30", "Pilot Corridor Launch", "• Deploy VeloCity edge-CV app to 150 General Trade & 40 Salon doors in Mumbai & Delhi NCR.\n• Benchmark OCR & shelf dust detection accuracy across varied lighting and store setups.\n• Validate baseline store freshness scores against distributor secondary billing data."),
    ("PHASE 2: DAYS 31–60", "Intervention Activation", "• Activate lateral 'StockSwap' protocols between neighboring distributor territories.\n• Launch dynamic B2B margin bundling within Sales Force Automation (SFA) ordering flow.\n• Roll out Net Freshness Index (NFI) gamified leaderboard for field sales officers."),
    ("PHASE 3: DAYS 61–90", "National Scale & EPR", "• Full API integration with SAP / Distributor Management Systems (DMS) across West & North zones.\n• Direct regulatory telemetry for Extended Producer Responsibility (EPR) reporting.\n• Projected full ROI payback achieved within 4.5 months of regional commercial rollout.")
]

for i, (badge, title, desc) in enumerate(phases):
    x = Inches(0.8 + i * 4.0)
    card = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.5), Inches(3.7), Inches(3.5))
    card.fill.solid()
    card.fill.fore_color.rgb = RGBColor(19, 30, 49)
    card.line.color.rgb = C_GOLD if i == 0 else RGBColor(51, 65, 85)
    tfc = card.text_frame
    tfc.word_wrap = True
    p1 = tfc.paragraphs[0]
    p1.text = badge
    p1.font.size = Pt(10)
    p1.font.bold = True
    p1.font.color.rgb = C_GOLD
    p2 = tfc.add_paragraph()
    p2.text = title
    p2.font.size = Pt(13)
    p2.font.bold = True
    p2.font.color.rgb = RGBColor(255, 255, 255)
    p3 = tfc.add_paragraph()
    p3.text = f"\n{desc}"
    p3.font.size = Pt(9.5)
    p3.font.color.rgb = RGBColor(203, 213, 225)

# Bottom Team Panel
team_panel = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.2), Inches(11.7), Inches(1.7))
team_panel.fill.solid()
team_panel.fill.fore_color.rgb = RGBColor(22, 33, 52)
team_panel.line.color.rgb = C_GOLD
tft = team_panel.text_frame
tft.word_wrap = True

pt1 = tft.paragraphs[0]
pt1.text = "L'ORÉAL FOR THE FUTURE: ZERO-WASTE COMMERCIAL EXCELLENCE"
pt1.font.size = Pt(12)
pt1.font.bold = True
pt1.font.color.rgb = RGBColor(243, 229, 200)

pt2 = tft.add_paragraph()
pt2.text = (
    "\nTEAM SUBMISSION DETAILS:\n"
    "• Team Name: [ Insert Team Name ]\n"
    "• Institution: [ Insert B-School / College Name ]\n"
    "• Team Members: [ Member 1 | Member 2 | Member 3 ]\n"
    "• Selected Track: Sales Track — Selling Smarter: Building a High-Impact Sales Engine with Reduced Waste"
)
pt2.font.size = Pt(9.5)
pt2.font.color.rgb = RGBColor(203, 213, 225)

prs.save("Loreal_VeloCity_AI_Presentation.pptx")
print("Presentation regenerated with native clean shapes and zero matplotlib text overlap!")
