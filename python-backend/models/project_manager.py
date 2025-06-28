import os
import json
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from collections import defaultdict
import re

@dataclass
class FileInfo:
    name: str
    path: str
    size: int
    language: str
    complexity: int
    dependencies: List[str]

@dataclass
class ProjectStructure:
    total_files: int
    languages: Dict[str, int]
    file_tree: Dict[str, Any]
    dependencies: Dict[str, List[str]]

@dataclass
class ProjectMetrics:
    total_lines: int
    total_complexity: int
    test_coverage: float
    documentation_coverage: float
    dependency_count: int

@dataclass
class ProjectAnalysisResult:
    structure: ProjectStructure
    metrics: ProjectMetrics
    recommendations: List[str]
    health_score: float

class ProjectManager:
    def __init__(self):
        self.language_extensions = {
            '.py': 'python',
            '.js': 'javascript',
            '.ts': 'typescript',
            '.jsx': 'javascript',
            '.tsx': 'typescript',
            '.java': 'java',
            '.cpp': 'cpp',
            '.c': 'c',
            '.h': 'c',
            '.hpp': 'cpp',
            '.html': 'html',
            '.css': 'css',
            '.json': 'json',
            '.xml': 'xml',
            '.yaml': 'yaml',
            '.yml': 'yaml',
            '.md': 'markdown',
            '.sql': 'sql',
            '.sh': 'bash',
            '.go': 'go',
            '.rs': 'rust',
            '.php': 'php',
            '.rb': 'ruby'
        }

    async def analyze_project(
        self,
        files: Dict[str, str],
        analysis_type: str = "structure"
    ) -> ProjectAnalysisResult:
        # Analyze project structure
        structure = self._analyze_structure(files)
        
        # Calculate metrics
        metrics = self._calculate_metrics(files)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(files, structure, metrics)
        
        # Calculate health score
        health_score = self._calculate_health_score(structure, metrics)
        
        return ProjectAnalysisResult(
            structure=structure,
            metrics=metrics,
            recommendations=recommendations,
            health_score=health_score
        )

    def _analyze_structure(self, files: Dict[str, str]) -> ProjectStructure:
        languages = defaultdict(int)
        dependencies = defaultdict(list)
        file_tree = {}
        
        for filepath, content in files.items():
            # Determine language
            ext = os.path.splitext(filepath)[1].lower()
            language = self.language_extensions.get(ext, 'unknown')
            languages[language] += 1
            
            # Extract dependencies
            file_deps = self._extract_dependencies(content, language)
            if file_deps:
                dependencies[filepath] = file_deps
            
            # Build file tree
            self._add_to_tree(file_tree, filepath)
        
        return ProjectStructure(
            total_files=len(files),
            languages=dict(languages),
            file_tree=file_tree,
            dependencies=dict(dependencies)
        )

    def _extract_dependencies(self, content: str, language: str) -> List[str]:
        dependencies = []
        
        if language == 'python':
            # Extract Python imports
            import_patterns = [
                r'import\s+([a-zA-Z_][a-zA-Z0-9_]*)',
                r'from\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+import',
            ]
            for pattern in import_patterns:
                matches = re.findall(pattern, content)
                dependencies.extend(matches)
        
        elif language in ['javascript', 'typescript']:
            # Extract JS/TS imports
            import_patterns = [
                r'import.*from\s+[\'"]([^\'"]+)[\'"]',
                r'require\s*\(\s*[\'"]([^\'"]+)[\'"]\s*\)',
            ]
            for pattern in import_patterns:
                matches = re.findall(pattern, content)
                dependencies.extend(matches)
        
        elif language == 'java':
            # Extract Java imports
            matches = re.findall(r'import\s+([a-zA-Z_][a-zA-Z0-9_.]*);', content)
            dependencies.extend(matches)
        
        return list(set(dependencies))  # Remove duplicates

    def _add_to_tree(self, tree: Dict[str, Any], filepath: str):
        parts = filepath.split('/')
        current = tree
        
        for part in parts[:-1]:
            if part not in current:
                current[part] = {}
            current = current[part]
        
        # Add file
        filename = parts[-1]
        current[filename] = None

    def _calculate_metrics(self, files: Dict[str, str]) -> ProjectMetrics:
        total_lines = 0
        total_complexity = 0
        test_files = 0
        doc_files = 0
        
        for filepath, content in files.items():
            lines = len([line for line in content.split('\n') if line.strip()])
            total_lines += lines
            
            # Simple complexity calculation
            complexity = (
                content.count('if') + 
                content.count('while') + 
                content.count('for') + 
                content.count('switch') + 
                content.count('case')
            )
            total_complexity += complexity
            
            # Check for test files
            if any(test_indicator in filepath.lower() for test_indicator in ['test', 'spec']):
                test_files += 1
            
            # Check for documentation
            if any(doc_indicator in filepath.lower() for doc_indicator in ['readme', 'doc', '.md']):
                doc_files += 1
        
        # Calculate coverage estimates
        test_coverage = min(100.0, (test_files / max(1, len(files))) * 100)
        doc_coverage = min(100.0, (doc_files / max(1, len(files))) * 100)
        
        # Count unique dependencies
        all_deps = set()
        for filepath, content in files.items():
            ext = os.path.splitext(filepath)[1].lower()
            language = self.language_extensions.get(ext, 'unknown')
            deps = self._extract_dependencies(content, language)
            all_deps.update(deps)
        
        return ProjectMetrics(
            total_lines=total_lines,
            total_complexity=total_complexity,
            test_coverage=test_coverage,
            documentation_coverage=doc_coverage,
            dependency_count=len(all_deps)
        )

    def _generate_recommendations(
        self,
        files: Dict[str, str],
        structure: ProjectStructure,
        metrics: ProjectMetrics
    ) -> List[str]:
        recommendations = []
        
        # Test coverage recommendations
        if metrics.test_coverage < 50:
            recommendations.append("Consider adding more test files to improve test coverage")
        
        # Documentation recommendations
        if metrics.documentation_coverage < 20:
            recommendations.append("Add documentation files (README, API docs) to improve project clarity")
        
        # Complexity recommendations
        avg_complexity = metrics.total_complexity / max(1, structure.total_files)
        if avg_complexity > 10:
            recommendations.append("Consider refactoring complex functions to improve maintainability")
        
        # Structure recommendations
        if structure.total_files > 50 and 'src' not in str(structure.file_tree):
            recommendations.append("Consider organizing files into src/ directory for better structure")
        
        # Language diversity
        if len(structure.languages) > 5:
            recommendations.append("Multiple languages detected - ensure consistent coding standards across all languages")
        
        # Dependency management
        if metrics.dependency_count > 20:
            recommendations.append("High number of dependencies - consider dependency audit for security and maintenance")
        
        # Configuration files
        config_files = ['package.json', 'requirements.txt', 'pom.xml', 'Cargo.toml', 'go.mod']
        has_config = any(config in files for config in config_files)
        if not has_config and structure.total_files > 5:
            recommendations.append("Consider adding dependency management configuration file")
        
        return recommendations

    def _calculate_health_score(
        self,
        structure: ProjectStructure,
        metrics: ProjectMetrics
    ) -> float:
        score = 100.0
        
        # Penalize for low test coverage
        if metrics.test_coverage < 30:
            score -= 20
        elif metrics.test_coverage < 60:
            score -= 10
        
        # Penalize for low documentation
        if metrics.documentation_coverage < 10:
            score -= 15
        elif metrics.documentation_coverage < 30:
            score -= 8
        
        # Penalize for high complexity
        avg_complexity = metrics.total_complexity / max(1, structure.total_files)
        if avg_complexity > 15:
            score -= 20
        elif avg_complexity > 10:
            score -= 10
        
        # Bonus for good structure
        if structure.total_files > 10:
            if any('src' in str(structure.file_tree) for _ in [1]):
                score += 5
            if any('test' in str(structure.file_tree).lower() for _ in [1]):
                score += 5
        
        return max(0.0, min(100.0, score))