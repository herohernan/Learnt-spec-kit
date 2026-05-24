#!/usr/bin/env python3
import subprocess
import json
import os
import sys
import re

def run_git_command(args):
    """Run a git command and return output"""
    try:
        result = subprocess.run(
            ['git'] + args,
            capture_output=True,
            text=True,
            timeout=10,
            cwd=r'C:\##Git\Learnt-spec-kit'
        )
        return result.returncode, result.stdout.strip(), result.stderr.strip()
    except Exception as e:
        return -1, '', str(e)

def main():
    result = {
        'BRANCH_NAME': None,
        'FEATURE_NUM': None,
        'HAS_GIT': False,
        'warning': None
    }
    
    try:
        # Check if in git repository
        returncode, stdout, stderr = run_git_command(['rev-parse', '--is-inside-work-tree'])
        
        if returncode == 0 and stdout == 'true':
            result['HAS_GIT'] = True
        else:
            result['warning'] = 'Not in a git repository'
            print(json.dumps(result, indent=2))
            return
        
        # Get all branches
        returncode, stdout, stderr = run_git_command(['branch', '-a'])
        
        if returncode != 0:
            result['warning'] = f'Failed to get branches: {stderr}'
            print(json.dumps(result, indent=2))
            return
        
        branches = [b.strip() for b in stdout.split('\n') if b.strip()]
        
        # Find highest sequential number (format: NNN-*)
        highest_num = 0
        pattern = r'^[\*\s]*(\d{3})-'
        
        for branch in branches:
            branch_clean = branch.strip()
            if branch_clean.startswith('*'):
                branch_clean = branch_clean[1:].strip()
            if branch_clean.startswith('remotes/'):
                continue
            
            match = re.match(pattern, branch_clean)
            if match:
                num = int(match.group(1))
                if num > highest_num:
                    highest_num = num
        
        # Calculate next number
        next_num = highest_num + 1
        feature_num = f'{next_num:03d}'
        branch_name = f'{feature_num}-organize-photo-albums'
        
        # Create new branch
        returncode, stdout, stderr = run_git_command(['branch', branch_name])
        if returncode != 0:
            result['warning'] = f'Failed to create branch: {stderr}'
            print(json.dumps(result, indent=2))
            return
        
        # Switch to new branch
        returncode, stdout, stderr = run_git_command(['checkout', branch_name])
        if returncode != 0:
            result['warning'] = f'Failed to switch to branch: {stderr}'
            print(json.dumps(result, indent=2))
            return
        
        # Success
        result['BRANCH_NAME'] = branch_name
        result['FEATURE_NUM'] = feature_num
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        result['warning'] = f'Unexpected error: {str(e)}'
        print(json.dumps(result, indent=2))
        sys.exit(1)

if __name__ == '__main__':
    main()
