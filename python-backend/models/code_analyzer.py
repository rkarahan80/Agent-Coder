import ast
import re
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import json

@dataclass
class CodeIssue:
    type: str
    severity: str  # low, medium, high, critical
    line: Optional[int]
    message: str
    suggestion: Optional[str] = None

@dataclass
class CodeMetrics:
    lines_of_code: int
    complexity: int
    maintainability_index: float
    test_coverage: Optional[float] = None

@dataclass
class CodeAnalysisResult:
    issues: List[CodeIssue]
    metrics: CodeMetrics
    suggestions: List[str]
    security_score: float
    quality_score: float

class CodeAnalyzer:
    def __init__(self):
        self.analyzers = {
            "python": self._analyze_python,
            "javascript": self._analyze_javascript,
            "typescript": self._analyze_typescript,
            "java": self._analyze_java,
            "cpp": self._analyze_cpp,
            "c": self._analyze_c
        }

    async def analyze(
        self,
        code: str,
        language: str,
        analysis_type: str = "quality"
    ) -> CodeAnalysisResult:
        if language.lower() not in self.analyzers:
            return self._basic_analysis(code, language)
        
        return await self.analyzers[language.lower()](code, analysis_type)

    async def _analyze_python(self, code: str, analysis_type: str) -> CodeAnalysisResult:
        issues = []
        suggestions = []
        
        try:
            tree = ast.parse(code)
            
            # Check for common issues
            issues.extend(self._check_python_style(code))
            issues.extend(self._check_python_security(code))
            issues.extend(self._check_python_performance(code))
            
            # Calculate metrics
            metrics = self._calculate_python_metrics(code, tree)
            
            # Generate suggestions
            suggestions = self._generate_python_suggestions(code, tree)
            
            # Calculate scores
            security_score = self._calculate_security_score(issues)
            quality_score = self._calculate_quality_score(issues, metrics)
            
        except SyntaxError as e:
            issues.append(CodeIssue(
                type="syntax",
                severity="critical",
                line=e.lineno,
                message=f"Syntax error: {e.msg}",
                suggestion="Fix the syntax error before proceeding"
            ))
            metrics = CodeMetrics(0, 0, 0.0)
            security_score = 0.0
            quality_score = 0.0
        
        return CodeAnalysisResult(
            issues=issues,
            metrics=metrics,
            suggestions=suggestions,
            security_score=security_score,
            quality_score=quality_score
        )

    def _check_python_style(self, code: str) -> List[CodeIssue]:
        issues = []
        lines = code.split('\n')
        
        for i, line in enumerate(lines, 1):
            # Check line length
            if len(line) > 88:
                issues.append(CodeIssue(
                    type="style",
                    severity="low",
                    line=i,
                    message="Line too long (>88 characters)",
                    suggestion="Break long lines for better readability"
                ))
            
            # Check for trailing whitespace
            if line.endswith(' ') or line.endswith('\t'):
                issues.append(CodeIssue(
                    type="style",
                    severity="low",
                    line=i,
                    message="Trailing whitespace",
                    suggestion="Remove trailing whitespace"
                ))
        
        return issues

    def _check_python_security(self, code: str) -> List[CodeIssue]:
        issues = []
        
        # Check for dangerous functions
        dangerous_patterns = [
            (r'eval\s*\(', "Use of eval() is dangerous"),
            (r'exec\s*\(', "Use of exec() is dangerous"),
            (r'__import__\s*\(', "Dynamic imports can be dangerous"),
            (r'input\s*\(', "Consider using safer input validation"),
            (r'pickle\.loads?\s*\(', "Pickle can execute arbitrary code")
        ]
        
        lines = code.split('\n')
        for i, line in enumerate(lines, 1):
            for pattern, message in dangerous_patterns:
                if re.search(pattern, line):
                    issues.append(CodeIssue(
                        type="security",
                        severity="high",
                        line=i,
                        message=message,
                        suggestion="Consider safer alternatives"
                    ))
        
        return issues

    def _check_python_performance(self, code: str) -> List[CodeIssue]:
        issues = []
        lines = code.split('\n')
        
        for i, line in enumerate(lines, 1):
            # Check for inefficient patterns
            if re.search(r'for\s+\w+\s+in\s+range\s*\(\s*len\s*\(', line):
                issues.append(CodeIssue(
                    type="performance",
                    severity="medium",
                    line=i,
                    message="Use enumerate() instead of range(len())",
                    suggestion="for i, item in enumerate(items):"
                ))
            
            if '+=' in line and 'str' in line.lower():
                issues.append(CodeIssue(
                    type="performance",
                    severity="medium",
                    line=i,
                    message="String concatenation in loop is inefficient",
                    suggestion="Use join() or f-strings instead"
                ))
        
        return issues

    def _calculate_python_metrics(self, code: str, tree: ast.AST) -> CodeMetrics:
        lines = [line for line in code.split('\n') if line.strip()]
        loc = len(lines)
        
        # Calculate cyclomatic complexity
        complexity = self._calculate_complexity(tree)
        
        # Simple maintainability index calculation
        maintainability = max(0, 171 - 5.2 * complexity - 0.23 * loc)
        
        return CodeMetrics(
            lines_of_code=loc,
            complexity=complexity,
            maintainability_index=maintainability
        )

    def _calculate_complexity(self, tree: ast.AST) -> int:
        complexity = 1  # Base complexity
        
        for node in ast.walk(tree):
            if isinstance(node, (ast.If, ast.While, ast.For, ast.AsyncFor)):
                complexity += 1
            elif isinstance(node, ast.ExceptHandler):
                complexity += 1
            elif isinstance(node, (ast.And, ast.Or)):
                complexity += 1
        
        return complexity

    def _generate_python_suggestions(self, code: str, tree: ast.AST) -> List[str]:
        suggestions = []
        
        # Check for missing docstrings
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.ClassDef)):
                if not ast.get_docstring(node):
                    suggestions.append(f"Add docstring to {node.name}")
        
        # Check for type hints
        if 'def ' in code and '->' not in code:
            suggestions.append("Consider adding type hints for better code documentation")
        
        # Check for error handling
        if 'try:' not in code and ('open(' in code or 'requests.' in code):
            suggestions.append("Add error handling for file operations or network requests")
        
        return suggestions

    async def _analyze_javascript(self, code: str, analysis_type: str) -> CodeAnalysisResult:
        # Basic JavaScript analysis
        return self._basic_analysis(code, "javascript")

    async def _analyze_typescript(self, code: str, analysis_type: str) -> CodeAnalysisResult:
        # Basic TypeScript analysis
        return self._basic_analysis(code, "typescript")

    async def _analyze_java(self, code: str, analysis_type: str) -> CodeAnalysisResult:
        # Basic Java analysis
        return self._basic_analysis(code, "java")

    async def _analyze_cpp(self, code: str, analysis_type: str) -> CodeAnalysisResult:
        # Basic C++ analysis
        return self._basic_analysis(code, "cpp")

    async def _analyze_c(self, code: str, analysis_type: str) -> CodeAnalysisResult:
        # Basic C analysis
        return self._basic_analysis(code, "c")

    def _basic_analysis(self, code: str, language: str) -> CodeAnalysisResult:
        lines = [line for line in code.split('\n') if line.strip()]
        loc = len(lines)
        
        issues = []
        suggestions = [
            f"Consider using a dedicated {language} linter for detailed analysis",
            "Add comments to explain complex logic",
            "Follow language-specific style guidelines"
        ]
        
        # Basic complexity estimation
        complexity = code.count('if') + code.count('while') + code.count('for') + 1
        
        metrics = CodeMetrics(
            lines_of_code=loc,
            complexity=complexity,
            maintainability_index=max(0, 100 - complexity * 2)
        )
        
        return CodeAnalysisResult(
            issues=issues,
            metrics=metrics,
            suggestions=suggestions,
            security_score=75.0,  # Default score
            quality_score=80.0    # Default score
        )

    def _calculate_security_score(self, issues: List[CodeIssue]) -> float:
        security_issues = [issue for issue in issues if issue.type == "security"]
        if not security_issues:
            return 100.0
        
        score = 100.0
        for issue in security_issues:
            if issue.severity == "critical":
                score -= 30
            elif issue.severity == "high":
                score -= 20
            elif issue.severity == "medium":
                score -= 10
            else:
                score -= 5
        
        return max(0.0, score)

    def _calculate_quality_score(self, issues: List[CodeIssue], metrics: CodeMetrics) -> float:
        score = metrics.maintainability_index
        
        for issue in issues:
            if issue.severity == "critical":
                score -= 15
            elif issue.severity == "high":
                score -= 10
            elif issue.severity == "medium":
                score -= 5
            else:
                score -= 2
        
        return max(0.0, min(100.0, score))