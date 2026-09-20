"""Render the public general resume from JSON exported from content/resume.ts."""
import json
import sys
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether

source, destination = sys.argv[1:3]
data = json.load(open(source))
styles = {
    'name': ParagraphStyle('name', fontName='Helvetica-Bold', fontSize=21, leading=25, spaceAfter=6),
    'headline': ParagraphStyle('headline', fontName='Helvetica-Bold', fontSize=11, leading=15, spaceAfter=5),
    'body': ParagraphStyle('body', fontName='Helvetica', fontSize=9.3, leading=12.8, spaceAfter=5),
    'section': ParagraphStyle('section', fontName='Helvetica-Bold', fontSize=10, leading=14, spaceBefore=13, spaceAfter=7),
    'role': ParagraphStyle('role', fontName='Helvetica-Bold', fontSize=10, leading=14, spaceBefore=8, spaceAfter=3),
    'meta': ParagraphStyle('meta', fontName='Helvetica', fontSize=9, leading=12, textColor=colors.HexColor('#555555'), spaceAfter=6),
    'bullet': ParagraphStyle('bullet', fontName='Helvetica', fontSize=9.3, leading=12.8, leftIndent=10, firstLineIndent=-8, spaceAfter=4),
}
def p(text, kind='body'):
    return Paragraph(escape(text), styles[kind])
def role(item):
    result = [KeepTogether([p(item['title'], 'role'), p(item['company']+' | '+item['period'], 'meta')])]
    result += [p('- '+line, 'bullet') for line in item['highlights']]
    return result
story = [p('Louie Sakoda','name'),p(data['headline'],'headline'),p('San Francisco, CA | louie.sakoda@gmail.com | linkedin.com/in/louiesakoda | louiesakoda.com','meta'),p('SUMMARY','section'),p(data['summary']),p('EXPERIENCE','section')]
for item in data['roles'][:2]: story += role(item)
story += [PageBreak(),p('Louie Sakoda','headline'),p('EXPERIENCE, CONTINUED','section')]
for item in data['roles'][2:]: story += role(item)
story += [p('EDUCATION','section')]
for item in data['education']:
    story += [p(item['credential']+' | '+item['institution']),p(item['period']+(' | '+item['note'] if item.get('note') else ''),'meta')]
story += [p('SKILLS','section')]
for item in data['skillGroups']:
    story += [p(item['label'],'role'),p(', '.join(item['skills']))]
if data['additional']:
    story += [p('ADDITIONAL','section')]+[p(line) for line in data['additional']]
def footer(canvas, doc):
    canvas.setFont('Helvetica',8)
    canvas.setFillColor(colors.HexColor('#666666'))
    canvas.drawRightString(570,24,str(doc.page))
SimpleDocTemplate(destination, pagesize=(612,792), rightMargin=42,leftMargin=42,topMargin=35,bottomMargin=35,title='Louie Sakoda | Senior Product Designer',author='Louie Sakoda').build(story,onFirstPage=footer,onLaterPages=footer)
