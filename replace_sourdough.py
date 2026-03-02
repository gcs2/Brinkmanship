import os
import re

def replace_sourdough(directory):
    for root, dirs, files in os.walk(directory):
        # Skip hidden directories like .git or .gemini
        if '/.' in root.replace('\\', '/') or '\\.' in root:
            continue
            
        for file in files:
            if file.endswith('.md') or file.endswith('.py') or file.endswith('.txt'):
                filepath = os.path.join(root, file)
                
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    if 'CPI' in content or 'sourdough' in content:
                        # Replace exact matching cases
                        new_content = content.replace('CPI', 'CPI')
                        new_content = new_content.replace('CPI', 'CPI')
                        new_content = new_content.replace('consumer_price_index', 'consumer_price_index')
                        new_content = new_content.replace('consumerPriceIndex', 'consumerPriceIndex')
                        new_content = new_content.replace('Gallon of Milk', 'Gallon of Milk')
                        new_content = new_content.replace('CPI', 'CPI')
                        
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                            
                        print(f"Updated: {filepath}")
                except Exception as e:
                    print(f"Error reading {filepath}: {e}")

if __name__ == '__main__':
    project_dir = r"c:\Users\zephy\Documents\Brinkmanship"
    replace_sourdough(project_dir)
